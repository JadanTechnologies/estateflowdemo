
import React, { useState, useMemo } from 'react';
import { Property, Agent, Department, PropertyStatus, User, Tenant, Permission, Role, AuditLogEntry, PropertyDocument, PropertyType, UnitType, ShopTenantInfo } from '../types';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';

const PropertyForm: React.FC<{
    property: Partial<Property> | null;
    agents: Agent[];
    departments: Department[];
    properties: Property[]; // For selecting parent Estate/Plaza
    existingUnits?: Partial<Property>[]; // Existing units when editing Estate/Plaza
    onSave: (property: Property, units?: Partial<Property>[]) => void;
    onClose: () => void;
}> = ({ property, agents, departments, properties, existingUnits = [], onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Property>>({
        name: '', unitNumber: '', location: '', departmentId: '', rentAmount: 0, depositAmount: 0, owner: '', status: PropertyStatus.Vacant, agentId: '', notes: '', images: [], documents: [],
        propertyType: PropertyType.Standalone,
        ...property
    });
    
    // State for managing units under Estate/Plaza - initialize with existing units if provided
    const [units, setUnits] = useState<Partial<Property>[]>(existingUnits);
    const [showAddUnit, setShowAddUnit] = useState(false);
    const [editingUnitIndex, setEditingUnitIndex] = useState<number | null>(null);
    const [unitFormData, setUnitFormData] = useState<Partial<Property>>({
        name: '', unitNumber: '', rentAmount: 0, depositAmount: 0, status: PropertyStatus.Vacant, agentId: '', notes: ''
    });
    const [showTenantInfo, setShowTenantInfo] = useState(false);
    const [tenantInfo, setTenantInfo] = useState<ShopTenantInfo>({
        tenantName: '', tenantPhone: '', tenantEmail: '', leaseStartDate: '', leaseEndDate: '', rentDueDate: '1'
    });
    
    const [imageFiles, setImageFiles] = useState<FileList | null>(null);
    const [documentFiles, setDocumentFiles] = useState<FileList | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Get estates and plazas for parent selection
    const estatesAndPlazas = properties.filter(p => 
        p.propertyType === PropertyType.Estate || p.propertyType === PropertyType.Plaza
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: ['rentAmount', 'depositAmount'].includes(name) ? Number(value) : value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePropertyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as PropertyType;
        setFormData(prev => ({ 
            ...prev, 
            propertyType: value,
            // Reset unit type when changing property type
            unitType: undefined,
            parentPropertyId: undefined
        }));
    };

    const handleUnitTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as UnitType;
        setFormData(prev => ({ ...prev, unitType: value }));
        // Show tenant info form when Shop is selected
        setShowTenantInfo(value === UnitType.Shop);
    };

    const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUnitFormData(prev => ({ 
            ...prev, 
            [name]: ['rentAmount', 'depositAmount'].includes(name) ? Number(value) : value 
        }));
    };

    const handleTenantInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTenantInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const nonImageFiles = files.filter((file: File) => !file.type.startsWith('image/'));

            if (nonImageFiles.length > 0) {
                alert("Only image files are allowed. Please select valid images (e.g., JPG, PNG).");
                e.target.value = '';
                setImageFiles(null);
                return;
            }
            setImageFiles(e.target.files);
        }
    };
    
    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocumentFiles(e.target.files);
        }
    };
    
    const handleRemoveImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleRemoveDocument = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents?.filter((_, index) => index !== indexToRemove)
        }));
    };

    const addUnit = () => {
        if (!unitFormData.name?.trim() || !unitFormData.unitNumber?.trim()) {
            alert("Unit name and number are required.");
            return;
        }
        
        // For Estate/Plaza units, require rent and agent
        if ((formData.propertyType === PropertyType.Estate || formData.propertyType === PropertyType.Plaza) && !formData.parentPropertyId) {
            if (!unitFormData.rentAmount || unitFormData.rentAmount <= 0) {
                alert("Rent amount is required for each unit.");
                return;
            }
            if (!unitFormData.agentId) {
                alert("An agent must be assigned to each unit.");
                return;
            }
        }
        
        const newUnit: Partial<Property> = {
            ...unitFormData,
            id: editingUnitIndex !== null ? units[editingUnitIndex].id : Date.now().toString(),
            // Auto-set status to Occupied if tenant info is provided (for Shops)
            status: (unitFormData.unitType === UnitType.Shop && tenantInfo.tenantName) 
                ? PropertyStatus.Occupied 
                : (unitFormData.status || PropertyStatus.Vacant),
            // Add tenant info if it's a shop
            shopTenantInfo: unitFormData.unitType === UnitType.Shop ? tenantInfo : undefined
        };
        
        if (editingUnitIndex !== null) {
            const updatedUnits = [...units];
            updatedUnits[editingUnitIndex] = newUnit;
            setUnits(updatedUnits);
            setEditingUnitIndex(null);
        } else {
            setUnits([...units, newUnit]);
        }
        
        // Reset unit form
        setUnitFormData({
            name: '', unitNumber: '', rentAmount: 0, depositAmount: 0, status: PropertyStatus.Vacant, agentId: '', notes: ''
        });
        setShowAddUnit(false);
        setShowTenantInfo(false);
        setTenantInfo({
            tenantName: '', tenantPhone: '', tenantEmail: '', leaseStartDate: '', leaseEndDate: '', rentDueDate: '1'
        });
    };

    const editUnit = (index: number) => {
        const unit = units[index];
        setUnitFormData(unit);
        setEditingUnitIndex(index);
        if (unit.shopTenantInfo) {
            setTenantInfo(unit.shopTenantInfo);
            setShowTenantInfo(true);
        }
        setShowAddUnit(true);
    };

    const deleteUnit = (index: number) => {
        setUnits(units.filter((_, i) => i !== index));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name?.trim()) newErrors.name = "Property name is required.";
        if (!formData.location?.trim()) newErrors.location = "Location is required.";
        if (!formData.departmentId) newErrors.departmentId = "Department is required.";
        
        // Only require rent, deposit, and agent for Standalone properties
        // For Estate/Plaza, these are set in the units
        if (formData.propertyType === PropertyType.Standalone) {
            if ((formData.rentAmount ?? 0) <= 0) newErrors.rentAmount = "Rent amount must be a positive number.";
            if ((formData.depositAmount ?? 0) < 0) newErrors.depositAmount = "Deposit amount cannot be negative.";
            if (!formData.agentId) newErrors.agentId = "An agent must be assigned.";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        // Process Images
        const newImageUrls: string[] = [];
        if (imageFiles && imageFiles.length > 0) {
            const promises = Array.from(imageFiles).map((file: File) => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = error => reject(error);
                });
            });
            try {
                const base64strings = await Promise.all(promises);
                newImageUrls.push(...base64strings);
            } catch (error) {
                console.error("Error converting images to base64", error);
                alert("There was an error uploading images. Please try again.");
                return;
            }
        }
        
        // Process Documents
        const newDocuments: PropertyDocument[] = [];
        if (documentFiles && documentFiles.length > 0) {
            const promises = Array.from(documentFiles).map((file: File) => {
                return new Promise<PropertyDocument>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve({ name: file.name, url: reader.result as string });
                    reader.onerror = error => reject(error);
                });
            });
            try {
                const docs = await Promise.all(promises);
                newDocuments.push(...docs);
            } catch (error) {
                console.error("Error converting documents to base64", error);
                alert("There was an error uploading documents. Please try again.");
                return;
            }
        }
        
        const updatedImages = [...(formData.images || []), ...newImageUrls];
        const updatedDocuments = [...(formData.documents || []), ...newDocuments];
        
        // Save main property
        const mainProperty: Property = {
            id: property?.id || Date.now().toString(),
            ...formData,
            images: updatedImages,
            documents: updatedDocuments
        } as Property;
        
        // Pass both the main property and units to onSave
        if ((formData.propertyType === PropertyType.Estate || formData.propertyType === PropertyType.Plaza) && units.length > 0) {
            onSave(mainProperty, units);
        } else {
            onSave(mainProperty);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Property Type Selection */}
            <div className="bg-secondary p-4 rounded-lg border border-border">
                <h3 className="text-lg font-semibold mb-3">Property Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className={`flex items-center justify-center p-3 rounded border cursor-pointer transition-colors ${
                        formData.propertyType === PropertyType.Standalone 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}>
                        <input 
                            type="radio" 
                            name="propertyType" 
                            value={PropertyType.Standalone}
                            checked={formData.propertyType === PropertyType.Standalone}
                            onChange={handlePropertyTypeChange}
                            className="mr-2"
                        />
                        <span className="font-medium">Standalone Property</span>
                    </label>
                    <label className={`flex items-center justify-center p-3 rounded border cursor-pointer transition-colors ${
                        formData.propertyType === PropertyType.Estate 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}>
                        <input 
                            type="radio" 
                            name="propertyType" 
                            value={PropertyType.Estate}
                            checked={formData.propertyType === PropertyType.Estate}
                            onChange={handlePropertyTypeChange}
                            className="mr-2"
                        />
                        <span className="font-medium">Estate (with Houses)</span>
                    </label>
                    <label className={`flex items-center justify-center p-3 rounded border cursor-pointer transition-colors ${
                        formData.propertyType === PropertyType.Plaza 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}>
                        <input 
                            type="radio" 
                            name="propertyType" 
                            value={PropertyType.Plaza}
                            checked={formData.propertyType === PropertyType.Plaza}
                            onChange={handlePropertyTypeChange}
                            className="mr-2"
                        />
                        <span className="font-medium">Plaza (with Shops/Offices)</span>
                    </label>
                </div>
            </div>

            {/* Parent Property Selection (for units) */}
            {formData.parentPropertyId && (
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                    <h3 className="text-md font-semibold mb-3 text-blue-400">Unit Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Unit Type</label>
                            <select 
                                name="unitType" 
                                value={formData.unitType || ''} 
                                onChange={handleUnitTypeChange}
                                className="w-full bg-secondary p-2 rounded border border-border"
                                required
                            >
                                <option value="">Select Unit Type</option>
                                {formData.propertyType === PropertyType.Estate && (
                                    <option value={UnitType.House}>{UnitType.House}</option>
                                )}
                                {(formData.propertyType === PropertyType.Plaza) && (
                                    <>
                                        <option value={UnitType.Shop}>{UnitType.Shop}</option>
                                        <option value={UnitType.Office}>{UnitType.Office}</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Unit Number</label>
                            <input 
                                name="unitNumber" 
                                value={formData.unitNumber || ''} 
                                onChange={handleChange}
                                placeholder="e.g., Shop 1, Office A"
                                className="w-full bg-secondary p-2 rounded border border-border"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Property Form (for Estate/Plaza or Standalone) */}
            {(!formData.parentPropertyId) && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <input name="name" value={formData.name || ''} onChange={handleChange} placeholder={formData.propertyType === PropertyType.Estate ? "Estate Name" : formData.propertyType === PropertyType.Plaza ? "Plaza Name" : "Property Name"} className={`w-full bg-secondary p-2 rounded border ${errors.name ? 'border-red-500' : 'border-border'}`} required />
                            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <input name="location" value={formData.location || ''} onChange={handleChange} placeholder="Location" className={`w-full bg-secondary p-2 rounded border ${errors.location ? 'border-red-500' : 'border-border'}`} required />
                            {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
                        </div>
                        <div>
                            <select name="departmentId" value={formData.departmentId || ''} onChange={handleChange} className={`w-full bg-secondary p-2 rounded border ${errors.departmentId ? 'border-red-500' : 'border-border'}`} required>
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            {errors.departmentId && <p className="text-red-400 text-xs mt-1">{errors.departmentId}</p>}
                        </div>
                        <div>
                            <input name="owner" value={formData.owner || ''} onChange={handleChange} placeholder="Owner (Optional)" className="w-full bg-secondary p-2 rounded border border-border" />
                        </div>
                        {/* Only show status for Standalone properties */}
                        {formData.propertyType === PropertyType.Standalone && (
                            <div>
                                <select name="status" value={formData.status || PropertyStatus.Vacant} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border">
                                    {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Info box for Estate/Plaza - explains where to add rent and agent */}
                    {(formData.propertyType === PropertyType.Estate || formData.propertyType === PropertyType.Plaza) && (
                        <div className="mt-4 bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                            <h4 className="font-semibold text-blue-400 mb-2">How to set rent and assign agents:</h4>
                            <p className="text-sm text-text-secondary">
                                After creating this {formData.propertyType === PropertyType.Estate ? 'Estate' : 'Plaza'}, 
                                click "<strong>Add Unit</strong>" below to add houses/shops/offices. 
                                Each unit will have its own rent amount and assigned agent.
                            </p>
                        </div>
                    )}

                    {/* Rent/Deposit fields only for Standalone properties */}
                    {formData.propertyType === PropertyType.Standalone && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Rent Amount (₦) *</label>
                                <input 
                                    type="text" 
                                    name="rentAmount" 
                                    value={formData.rentAmount?.toLocaleString() || '0'} 
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/,/g, '');
                                        if (!isNaN(Number(value))) {
                                            setFormData(prev => ({ ...prev, rentAmount: Number(value) }));
                                        }
                                    }} 
                                    placeholder="e.g. 500000 or 500,000" 
                                    className={`w-full bg-secondary p-2 rounded border ${errors.rentAmount ? 'border-red-500' : 'border-border'}`} 
                                />
                                <p className="text-xs text-text-secondary mt-1">Enter the yearly rent amount in Naira</p>
                                {errors.rentAmount && <p className="text-red-400 text-xs mt-1">{errors.rentAmount}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Deposit Amount (₦)</label>
                                <input 
                                    type="text" 
                                    name="depositAmount" 
                                    value={formData.depositAmount?.toLocaleString() || '0'} 
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/,/g, '');
                                        if (!isNaN(Number(value))) {
                                            setFormData(prev => ({ ...prev, depositAmount: Number(value) }));
                                        }
                                    }} 
                                    placeholder="e.g. 250000 or 250,000" 
                                    className={`w-full bg-secondary p-2 rounded border ${errors.depositAmount ? 'border-red-500' : 'border-border'}`} 
                                />
                                <p className="text-xs text-text-secondary mt-1">Security deposit (usually equal to rent)</p>
                                {errors.depositAmount && <p className="text-red-400 text-xs mt-1">{errors.depositAmount}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <select name="agentId" value={formData.agentId || ''} onChange={handleChange} className={`w-full bg-secondary p-2 rounded border ${errors.agentId ? 'border-red-500' : 'border-border'}`} required>
                                    <option value="">Assign Agent *</option>
                                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                                {errors.agentId && <p className="text-red-400 text-xs mt-1">{errors.agentId}</p>}
                            </div>
                        </div>
                    )}

                    <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Internal Notes" className="w-full bg-secondary p-2 rounded border border-border h-24 mt-4"></textarea>
                </>
            )}

            {/* Add Units Section (for Estate/Plaza) */}
            {(formData.propertyType === PropertyType.Estate || formData.propertyType === PropertyType.Plaza) && !formData.parentPropertyId && (
                <div className="bg-secondary p-4 rounded-lg border border-border">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            {formData.propertyType === PropertyType.Estate ? 'Houses' : 'Shops & Offices'}
                        </h3>
                        <button 
                            type="button" 
                            onClick={() => setShowAddUnit(true)}
                            className="bg-primary hover:bg-primary-hover text-white font-bold py-1 px-3 rounded text-sm"
                        >
                            + Add Unit
                        </button>
                    </div>

                    {units.length > 0 && (
                        <div className="mb-4 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-background">
                                    <tr>
                                        <th className="p-2">Unit Name</th>
                                        <th className="p-2">Unit Number</th>
                                        <th className="p-2">Type</th>
                                        <th className="p-2">Rent</th>
                                        <th className="p-2">Agent</th>
                                        <th className="p-2">Tenant</th>
                                        <th className="p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {units.map((unit, index) => (
                                        <tr key={index} className="border-b border-border/50">
                                            <td className="p-2">{unit.name}</td>
                                            <td className="p-2">{unit.unitNumber}</td>
                                            <td className="p-2">{unit.unitType}</td>
                                            <td className="p-2">₦{(unit.rentAmount || 0).toLocaleString()}</td>
                                            <td className="p-2">{agents.find(a => a.id === unit.agentId)?.name || 'N/A'}</td>
                                            <td className="p-2">{unit.shopTenantInfo?.tenantName || '-'}</td>
                                            <td className="p-2">
                                                <button type="button" onClick={() => editUnit(index)} className="text-blue-400 hover:text-blue-300 mr-2">Edit</button>
                                                <button type="button" onClick={() => deleteUnit(index)} className="text-red-400 hover:text-red-300">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {units.length === 0 && !showAddUnit && (
                        <p className="text-text-secondary italic text-sm">No units added yet. Click "Add Unit" to add houses/shops/offices.</p>
                    )}

                    {/* Add/Edit Unit Form */}
                    {showAddUnit && (
                        <div className="mt-4 p-4 bg-background rounded border border-border">
                            <h4 className="font-semibold mb-3">{editingUnitIndex !== null ? 'Edit Unit' : 'Add New Unit'}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-xs text-text-secondary mb-1">Unit Name *</label>
                                    <input name="name" value={unitFormData.name || ''} onChange={handleUnitChange} placeholder="e.g., House 1, Shop A" className="w-full bg-secondary p-2 rounded border border-border text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs text-text-secondary mb-1">Unit Number/Code *</label>
                                    <input name="unitNumber" value={unitFormData.unitNumber || ''} onChange={handleUnitChange} placeholder="e.g., 001, A1" className="w-full bg-secondary p-2 rounded border border-border text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs text-text-secondary mb-1">Unit Type *</label>
                                    <select name="unitType" value={unitFormData.unitType || ''} onChange={(e) => {
                                        handleUnitChange(e);
                                        setShowTenantInfo(e.target.value === UnitType.Shop);
                                    }} className="w-full bg-secondary p-2 rounded border border-border text-sm">
                                        <option value="">Select Type</option>
                                        {formData.propertyType === PropertyType.Estate && (
                                            <option value={UnitType.House}>{UnitType.House}</option>
                                        )}
                                        {formData.propertyType === PropertyType.Plaza && (
                                            <>
                                                <option value={UnitType.Shop}>{UnitType.Shop}</option>
                                                <option value={UnitType.Office}>{UnitType.Office}</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-text-secondary mb-1">Yearly Rent (₦) * <span className="text-red-400">*</span></label>
                                    <input 
                                        type="text" 
                                        name="rentAmount" 
                                        value={unitFormData.rentAmount?.toLocaleString() || '0'} 
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/,/g, '');
                                            if (!isNaN(Number(value))) {
                                                setUnitFormData(prev => ({ ...prev, rentAmount: Number(value) }));
                                            }
                                        }} 
                                        placeholder="e.g. 500000" 
                                        className="w-full bg-secondary p-2 rounded border border-border text-sm" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-text-secondary mb-1">Deposit (₦)</label>
                                    <input 
                                        type="text" 
                                        name="depositAmount" 
                                        value={unitFormData.depositAmount?.toLocaleString() || '0'} 
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/,/g, '');
                                            if (!isNaN(Number(value))) {
                                                setUnitFormData(prev => ({ ...prev, depositAmount: Number(value) }));
                                            }
                                        }} 
                                        placeholder="e.g. 250000" 
                                        className="w-full bg-secondary p-2 rounded border border-border text-sm" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-text-secondary mb-1">Assign Agent * <span className="text-red-400">*</span></label>
                                    <select name="agentId" value={unitFormData.agentId || ''} onChange={handleUnitChange} className="w-full bg-secondary p-2 rounded border border-border text-sm">
                                        <option value="">Select Agent</option>
                                        {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-text-secondary mb-1">Status</label>
                                    <select name="status" value={unitFormData.status || PropertyStatus.Vacant} onChange={handleUnitChange} className="w-full bg-secondary p-2 rounded border border-border text-sm">
                                        {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Tenant Information (only for Shops) */}
                            {showTenantInfo && (
                                <div className="mt-3 p-3 bg-blue-500/10 rounded border border-blue-500/30">
                                    <h5 className="font-medium text-blue-400 mb-2">Tenant Information (for Shop)</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs text-text-secondary mb-1">Tenant Name</label>
                                            <input name="tenantName" value={tenantInfo.tenantName || ''} onChange={handleTenantInfoChange} placeholder="Tenant Full Name" className="w-full bg-secondary p-2 rounded border border-border text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-text-secondary mb-1">Tenant Phone</label>
                                            <input name="tenantPhone" value={tenantInfo.tenantPhone || ''} onChange={handleTenantInfoChange} placeholder="Phone Number" className="w-full bg-secondary p-2 rounded border border-border text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-text-secondary mb-1">Tenant Email</label>
                                            <input name="tenantEmail" value={tenantInfo.tenantEmail || ''} onChange={handleTenantInfoChange} placeholder="Email Address" className="w-full bg-secondary p-2 rounded border border-border text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-text-secondary mb-1">Lease Start Date</label>
                                            <input type="date" name="leaseStartDate" value={tenantInfo.leaseStartDate || ''} onChange={handleTenantInfoChange} className="w-full bg-secondary p-2 rounded border border-border text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-text-secondary mb-1">Lease End Date</label>
                                            <input type="date" name="leaseEndDate" value={tenantInfo.leaseEndDate || ''} onChange={handleTenantInfoChange} className="w-full bg-secondary p-2 rounded border border-border text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-text-secondary mb-1">Rent Due Date (Day of Month)</label>
                                            <input type="number" name="rentDueDate" value={tenantInfo.rentDueDate || '1'} onChange={handleTenantInfoChange} min="1" max="28" className="w-full bg-secondary p-2 rounded border border-border text-sm" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-3 flex justify-end space-x-2">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowAddUnit(false);
                                        setEditingUnitIndex(null);
                                        setShowTenantInfo(false);
                                        setTenantInfo({ tenantName: '', tenantPhone: '', tenantEmail: '', leaseStartDate: '', leaseEndDate: '', rentDueDate: '1' });
                                    }} 
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    onClick={addUnit}
                                    className="bg-primary hover:bg-primary-hover text-white font-bold py-1 px-3 rounded text-sm"
                                >
                                    {editingUnitIndex !== null ? 'Update Unit' : 'Add Unit'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Images Upload - For Standalone and Estate/Plaza (but not for units) */}
            {(!formData.parentPropertyId) && (
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Property Images</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover"
                    />
                </div>
            )}

            {formData.images && formData.images.length > 0 && !formData.parentPropertyId && (
                <div className="flex flex-wrap gap-2 p-2 bg-secondary rounded">
                    {formData.images.map((img, index) => (
                        <div key={index} className="relative">
                            <img src={img} alt={`Property image ${index + 1}`} className="w-24 h-24 rounded-lg object-cover" />
                            <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs backdrop-blur-sm"
                                title="Remove image"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Documents Upload */}
            {!formData.parentPropertyId && (
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Documents (Deeds, Permits, etc.)</label>
                    <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        onChange={handleDocumentChange}
                        className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover"
                    />
                </div>
            )}

            {formData.documents && formData.documents.length > 0 && !formData.parentPropertyId && (
                <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-2">Attached Documents</h4>
                    <ul className="space-y-2 p-2 bg-secondary rounded">
                        {formData.documents.map((doc, index) => (
                            <li key={index} className="flex items-center justify-between bg-background p-2 rounded text-sm">
                                <div className="flex items-center gap-2 truncate">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>{doc.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveDocument(index)}
                                    className="text-red-400 hover:text-red-300 text-xs font-semibold ml-2"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">
                    {formData.parentPropertyId ? 'Save Unit' : 'Save Property'}
                </button>
            </div>
        </form>
    );
};

const PropertyDetailModal: React.FC<{
    property: Property;
    agentName: string;
    departmentName: string;
    tenants: Tenant[];
    properties: Property[]; // For finding parent/child properties
    agents: Agent[]; // For displaying agent names
    onEditProperty?: (property: Property) => void; // Callback to edit property/units
    onDeleteUnit?: (unitId: string) => void; // Callback to delete a unit
    onUpdateUnitStatus?: (unitId: string, status: PropertyStatus) => void; // Callback to update unit status
    onClose: () => void;
}> = ({ property, agentName, departmentName, tenants, properties, agents, onEditProperty, onDeleteUnit, onUpdateUnitStatus, onClose }) => {
    const propertyTenants = tenants.filter(t => t.propertyId === property.id);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Find child units (if this is an Estate or Plaza)
    const childUnits = properties.filter((p: Property) => p.parentPropertyId === property.id);

    const goToNextImage = () => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % property.images.length);
    };

    const goToPrevImage = () => {
        setCurrentImageIndex(prevIndex => (prevIndex - 1 + property.images.length) % property.images.length);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Name:</strong> {property.name}</div>
                    <div><strong>Type:</strong> 
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            property.propertyType === PropertyType.Estate ? 'bg-purple-500/20 text-purple-400' :
                            property.propertyType === PropertyType.Plaza ? 'bg-blue-500/20 text-blue-400' :
                            property.unitType ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                        }`}>
                            {property.propertyType === PropertyType.Estate ? 'Estate' : 
                             property.propertyType === PropertyType.Plaza ? 'Plaza' : 
                             property.unitType ? property.unitType : 'Standalone Property'}
                        </span>
                    </div>
                    <div><strong>Unit:</strong> {property.unitNumber || 'N/A'}</div>
                    <div><strong>Location:</strong> {property.location}</div>
                    <div><strong>Department:</strong> {departmentName}</div>
                    {(property.propertyType === PropertyType.Estate || property.propertyType === PropertyType.Plaza) ? (
                        <div className="col-span-2 bg-blue-500/10 p-2 rounded border border-blue-500/30 text-sm">
                            <strong>Note:</strong> This {property.propertyType === PropertyType.Estate ? 'Estate' : 'Plaza'} does not have its own rent. Rent is determined by individual units (houses/shops/offices).
                        </div>
                    ) : (
                        <>
                            <div><strong>Rent:</strong> ₦{(property.rentAmount || 0).toLocaleString()}</div>
                            <div><strong>Deposit:</strong> ₦{(property.depositAmount || 0).toLocaleString()}</div>
                        </>
                    )}
                    <div><strong>Owner:</strong> {property.owner}</div>
                    <div><strong>Status:</strong> {property.status}</div>
                    <div><strong>Agent:</strong> {agentName}</div>
                </div>
                {property.notes && <div className="mt-4"><strong>Notes:</strong> <p className="text-text-secondary italic bg-secondary p-2 rounded">{property.notes}</p></div>}
            </div>

            {/* Child Units Section (for Estate/Plaza) with Summary */}
            {(property.propertyType === PropertyType.Estate || property.propertyType === PropertyType.Plaza) && (
                <div>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-secondary p-3 rounded-lg border border-border text-center">
                            <div className="text-2xl font-bold text-white">{childUnits.length}</div>
                            <div className="text-xs text-text-secondary">Total Units</div>
                        </div>
                        <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30 text-center">
                            <div className="text-2xl font-bold text-green-400">{childUnits.filter(u => u.status === PropertyStatus.Vacant).length}</div>
                            <div className="text-xs text-text-secondary">Vacant</div>
                        </div>
                        <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/30 text-center">
                            <div className="text-2xl font-bold text-red-400">{childUnits.filter(u => u.status === PropertyStatus.Occupied).length}</div>
                            <div className="text-xs text-text-secondary">Occupied</div>
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">
                        All Units in {property.propertyType === PropertyType.Estate ? 'Estate' : 'Plaza'}
                    </h3>
                    {childUnits.length === 0 ? (
                        <p className="text-text-secondary italic">No units added yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-secondary">
                                    <tr>
                                        <th className="p-2">Unit Name</th>
                                        <th className="p-2">Unit #</th>
                                        <th className="p-2">Type</th>
                                        <th className="p-2">Rent</th>
                                        <th className="p-2">Agent</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Tenant</th>
                                        <th className="p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {childUnits.map(unit => {
                                        // Find tenant for this unit
                                        const tenantInUnit = tenants.find(t => t.propertyId === unit.id);
                                        const tenantFromShopInfo = unit.shopTenantInfo?.tenantName;
                                        const hasTenant = tenantInUnit || tenantFromShopInfo;
                                        
                                        return (
                                            <tr key={unit.id} className="border-b border-border/50">
                                                <td className="p-2 font-medium">{unit.name}</td>
                                                <td className="p-2">{unit.unitNumber}</td>
                                                <td className="p-2">{unit.unitType}</td>
                                                <td className="p-2">₦{(unit.rentAmount || 0).toLocaleString()}</td>
                                                <td className="p-2">{agents.find(a => a.id === unit.agentId)?.name || 'N/A'}</td>
                                                <td className="p-2">
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                        unit.status === PropertyStatus.Occupied ? 'bg-red-500/20 text-red-400' :
                                                        unit.status === PropertyStatus.Vacant ? 'bg-green-500/20 text-green-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                        {unit.status}
                                                    </span>
                                                </td>
                                                <td className="p-2">
                                                    {tenantInUnit ? (
                                                        <span className="text-green-400">{tenantInUnit.fullName}</span>
                                                    ) : tenantFromShopInfo ? (
                                                        <span className="text-blue-400">{tenantFromShopInfo}</span>
                                                    ) : (
                                                        <span className="text-text-secondary">-</span>
                                                    )}
                                                </td>
                                                <td className="p-2">
                                                    {/* Status Dropdown */}
                                                    <select
                                                        value={unit.status}
                                                        onChange={(e) => {
                                                            if (onUpdateUnitStatus) {
                                                                onUpdateUnitStatus(unit.id, e.target.value as PropertyStatus);
                                                            }
                                                        }}
                                                        className="bg-secondary p-1 rounded border border-border text-xs"
                                                    >
                                                        {Object.values(PropertyStatus).map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2 space-x-1">
                                                    <button 
                                                        onClick={() => onEditProperty && onEditProperty(unit)} 
                                                        className="text-blue-400 hover:text-blue-300 text-xs"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this unit?')) {
                                                                onDeleteUnit && onDeleteUnit(unit.id);
                                                            }
                                                        }} 
                                                        className="text-red-400 hover:text-red-300 text-xs"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* For non-Estate/Plaza properties - show basic units if any */}
            {!(property.propertyType === PropertyType.Estate || property.propertyType === PropertyType.Plaza) && childUnits.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Units ({childUnits.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-secondary">
                                <tr>
                                    <th className="p-2">Unit Name</th>
                                    <th className="p-2">Unit #</th>
                                    <th className="p-2">Type</th>
                                    <th className="p-2">Rent</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Tenant</th>
                                </tr>
                            </thead>
                            <tbody>
                                {childUnits.map(unit => (
                                    <tr key={unit.id} className="border-b border-border/50">
                                        <td className="p-2">{unit.name}</td>
                                        <td className="p-2">{unit.unitNumber}</td>
                                        <td className="p-2">{unit.unitType}</td>
                                        <td className="p-2">₦{(unit.rentAmount || 0).toLocaleString()}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                unit.status === PropertyStatus.Occupied ? 'bg-red-500/20 text-red-400' :
                                                unit.status === PropertyStatus.Vacant ? 'bg-green-500/20 text-green-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {unit.status}
                                            </span>
                                        </td>
                                        <td className="p-2">{unit.shopTenantInfo?.tenantName || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Comprehensive Tenants Section (for Estate/Plaza - shows all tenants in all units) */}
            {(property.propertyType === PropertyType.Estate || property.propertyType === PropertyType.Plaza) && childUnits.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">
                        All Tenants in {property.propertyType === PropertyType.Estate ? 'Estate' : 'Plaza'}
                    </h3>
                    {(() => {
                        // Get all units with tenant info (from shopTenantInfo)
                        const unitsWithTenants = childUnits.filter(unit => unit.shopTenantInfo?.tenantName);
                        
                        // Also get tenants from the tenants list that are in any of these units
                        const unitIds = childUnits.map(u => u.id);
                        const tenantsInUnits = tenants.filter(t => unitIds.includes(t.propertyId));
                        
                        if (unitsWithTenants.length === 0 && tenantsInUnits.length === 0) {
                            return <p className="text-text-secondary italic">No tenants in this {property.propertyType === PropertyType.Estate ? 'Estate' : 'Plaza'} yet.</p>;
                        }
                        
                        return (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-secondary">
                                        <tr>
                                            <th className="p-2">Tenant Name</th>
                                            <th className="p-2">Unit</th>
                                            <th className="p-2">Unit #</th>
                                            <th className="p-2">Type</th>
                                            <th className="p-2">Phone</th>
                                            <th className="p-2">Email</th>
                                            <th className="p-2">Lease Start</th>
                                            <th className="p-2">Lease End</th>
                                            <th className="p-2">Rent</th>
                                            <th className="p-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Show tenants from shopTenantInfo */}
                                        {unitsWithTenants.map(unit => (
                                            <tr key={unit.id} className="border-b border-border/50">
                                                <td className="p-2 font-medium text-blue-400">{unit.shopTenantInfo?.tenantName}</td>
                                                <td className="p-2">{unit.name}</td>
                                                <td className="p-2">{unit.unitNumber}</td>
                                                <td className="p-2">{unit.unitType}</td>
                                                <td className="p-2">{unit.shopTenantInfo?.tenantPhone || '-'}</td>
                                                <td className="p-2">{unit.shopTenantInfo?.tenantEmail || '-'}</td>
                                                <td className="p-2">{unit.shopTenantInfo?.leaseStartDate || '-'}</td>
                                                <td className="p-2">{unit.shopTenantInfo?.leaseEndDate || '-'}</td>
                                                <td className="p-2">₦{(unit.rentAmount || 0).toLocaleString()}</td>
                                                <td className="p-2">
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                        unit.status === PropertyStatus.Occupied ? 'bg-red-500/20 text-red-400' :
                                                        unit.status === PropertyStatus.Vacant ? 'bg-green-500/20 text-green-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                        {unit.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Show tenants from tenants list */}
                                        {tenantsInUnits.map(tenant => {
                                            const unit = childUnits.find(u => u.id === tenant.propertyId);
                                            return (
                                                <tr key={tenant.id} className="border-b border-border/50">
                                                    <td className="p-2 font-medium text-green-400">{tenant.fullName}</td>
                                                    <td className="p-2">{unit?.name || 'N/A'}</td>
                                                    <td className="p-2">{unit?.unitNumber || '-'}</td>
                                                    <td className="p-2">{unit?.unitType || '-'}</td>
                                                    <td className="p-2">{tenant.phone || '-'}</td>
                                                    <td className="p-2">{tenant.email || '-'}</td>
                                                    <td className="p-2">{tenant.leaseStartDate || '-'}</td>
                                                    <td className="p-2">{tenant.leaseEndDate || '-'}</td>
                                                    <td className="p-2">₦{(unit?.rentAmount || 0).toLocaleString()}</td>
                                                    <td className="p-2">
                                                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500/20 text-red-400">
                                                            Occupied
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })()}
                </div>
            )}

            <div>
                <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Image Gallery</h3>
                {property.images.length > 0 ? (
                    <div className="relative">
                        {/* Main Image Display */}
                        <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
                            <img 
                                src={property.images[currentImageIndex]} 
                                alt={`Property image ${currentImageIndex + 1}`} 
                                className="max-h-80 w-auto object-contain rounded-lg transition-transform duration-300" 
                            />
                        </div>

                        {/* Navigation Buttons */}
                        {property.images.length > 1 && (
                            <>
                                <button onClick={goToPrevImage} className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 focus:outline-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button onClick={goToNextImage} className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 focus:outline-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    {currentImageIndex + 1} / {property.images.length}
                                </div>
                            </>
                        )}
                        
                        {/* Thumbnail Strip */}
                        {property.images.length > 1 && (
                            <div className="flex justify-center gap-2 mt-4 overflow-x-auto p-1">
                                {property.images.map((img, index) => (
                                    <img 
                                        key={index} 
                                        src={img} 
                                        alt={`Thumbnail ${index + 1}`} 
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 transition-all ${currentImageIndex === index ? 'border-primary scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-text-secondary italic text-sm">No images uploaded.</p>
                )}
            </div>
            
            <div>
                <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Documents</h3>
                 {property.documents && property.documents.length > 0 ? (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {property.documents.map((doc, index) => (
                            <li key={index} className="bg-secondary p-2 rounded border border-border/50 hover:border-primary/50 transition-colors">
                                <a href={doc.url} download={doc.name} className="flex items-center gap-3 group">
                                    <div className="p-2 bg-primary/10 rounded text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium truncate text-text-primary group-hover:text-primary transition-colors">{doc.name}</p>
                                        <p className="text-xs text-text-secondary">Click to download</p>
                                    </div>
                                </a>
                            </li>
                        ))}
                    </ul>
                 ) : <p className="text-text-secondary italic text-sm">No documents uploaded.</p>}
            </div>

            <div>
                <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Current Tenants</h3>
                {/* For Estate/Plaza, show all tenants from child units. For standalone, show direct tenants */}
                {(property.propertyType === PropertyType.Estate || property.propertyType === PropertyType.Plaza) ? (
                    childUnits.length > 0 ? (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-secondary">
                                <tr>
                                    <th className="p-2">Tenant Name</th>
                                    <th className="p-2">Unit</th>
                                    <th className="p-2">Unit #</th>
                                    <th className="p-2">Phone</th>
                                    <th className="p-2">Email</th>
                                    <th className="p-2">Lease End Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const unitIds = childUnits.map(u => u.id);
                                    const tenantsInChildUnits = tenants.filter(t => unitIds.includes(t.propertyId));
                                    
                                    // Also include tenants from shopTenantInfo
                                    const unitsWithShopTenants = childUnits.filter(u => u.shopTenantInfo?.tenantName);
                                    
                                    if (tenantsInChildUnits.length === 0 && unitsWithShopTenants.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan={6} className="p-4 text-center text-text-secondary italic">This property has no tenants.</td>
                                            </tr>
                                        );
                                    }
                                    
                                    return (
                                        <>
                                            {tenantsInChildUnits.map(tenant => {
                                                const unit = childUnits.find(u => u.id === tenant.propertyId);
                                                return (
                                                    <tr key={tenant.id} className="border-b border-border/50">
                                                        <td className="p-2">{tenant.fullName}</td>
                                                        <td className="p-2">{unit?.name || 'N/A'}</td>
                                                        <td className="p-2">{unit?.unitNumber || '-'}</td>
                                                        <td className="p-2">{tenant.phone || '-'}</td>
                                                        <td className="p-2">{tenant.email || '-'}</td>
                                                        <td className="p-2">{tenant.leaseEndDate || '-'}</td>
                                                    </tr>
                                                );
                                            })}
                                            {unitsWithShopTenants.map(unit => (
                                                <tr key={unit.id} className="border-b border-border/50">
                                                    <td className="p-2">{unit.shopTenantInfo?.tenantName}</td>
                                                    <td className="p-2">{unit.name}</td>
                                                    <td className="p-2">{unit.unitNumber}</td>
                                                    <td className="p-2">{unit.shopTenantInfo?.tenantPhone || '-'}</td>
                                                    <td className="p-2">{unit.shopTenantInfo?.tenantEmail || '-'}</td>
                                                    <td className="p-2">{unit.shopTenantInfo?.leaseEndDate || '-'}</td>
                                                </tr>
                                            ))}
                                        </>
                                    );
                                })()}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-text-secondary italic">This property has no units yet.</p>
                    )
                ) : (
                    propertyTenants.length > 0 ? (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-secondary">
                                <tr>
                                    <th className="p-2">Tenant Name</th>
                                    <th className="p-2">Phone</th>
                                    <th className="p-2">Email</th>
                                    <th className="p-2">Lease End Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {propertyTenants.map(tenant => (
                                    <tr key={tenant.id} className="border-b border-border/50">
                                        <td className="p-2">{tenant.fullName}</td>
                                        <td className="p-2">{tenant.phone || '-'}</td>
                                        <td className="p-2">{tenant.email || '-'}</td>
                                        <td className="p-2">{tenant.leaseEndDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-text-secondary italic">This property is currently vacant.</p>
                    )
                )}
            </div>
            
             <div className="flex justify-end pt-4">
                <button type="button" onClick={onClose} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Close</button>
            </div>
        </div>
    );
};

interface PropertiesProps {
  properties: Property[];
  agents: Agent[];
  tenants: Tenant[];
  departments: Department[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  currentUser: User;
  roles: Role[];
  userHasPermission: (permission: Permission) => boolean;
  addAuditLog: (action: string, details: string, targetId?: string) => void;
}

const Properties: React.FC<PropertiesProps> = ({ properties, agents, tenants, departments, setProperties, currentUser, roles, userHasPermission, addAuditLog }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [agentFilter, setAgentFilter] = useState('All');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('All');
  const [showOnlyParents, setShowOnlyParents] = useState(false);

  const userRole = useMemo(() => roles.find(r => r.id === currentUser.roleId), [roles, currentUser.roleId]);
  const canManageGlobally = userHasPermission(Permission.MANAGE_PROPERTIES);
  const canEditOwnProperty = userRole?.name === 'Agent' && userHasPermission(Permission.AGENT_CAN_EDIT_OWN_PROPERTIES);

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            property.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || property.status === statusFilter;
      const matchesAgent = agentFilter === 'All' || property.agentId === agentFilter;
      const matchesPropertyType = propertyTypeFilter === 'All' || 
        (propertyTypeFilter === 'Estate' && property.propertyType === PropertyType.Estate) ||
        (propertyTypeFilter === 'Plaza' && property.propertyType === PropertyType.Plaza) ||
        (propertyTypeFilter === 'Standalone' && (!property.propertyType || property.propertyType === PropertyType.Standalone));
      
      // Filter for parent properties only (Estates and Plazas)
      const isParentProperty = property.propertyType === PropertyType.Estate || property.propertyType === PropertyType.Plaza;
      const matchesParentFilter = !showOnlyParents || (showOnlyParents && isParentProperty);

      return matchesSearch && matchesStatus && matchesAgent && matchesPropertyType && matchesParentFilter;
    });
  }, [properties, searchQuery, statusFilter, agentFilter, propertyTypeFilter, showOnlyParents]);

  const handleSave = (property: Property, units?: Partial<Property>[]) => {
    if (selectedProperty) {
      setProperties(prev => prev.map(p => p.id === property.id ? property : p));
      addAuditLog('UPDATED_PROPERTY', `Updated property: ${property.name}`, property.id);
    } else {
      setProperties(prev => [...prev, property]);
      addAuditLog('CREATED_PROPERTY', `Created property: ${property.name}`, property.id);
    }
    
    // Save/update units if this is an Estate or Plaza
    if (units && units.length > 0) {
        // First, remove old units that were removed
        const existingChildUnits = properties.filter((p: Property) => p.parentPropertyId === property.id);
        const existingUnitIds = new Set<string>(existingChildUnits.map((u: Property) => u.id));
        const newUnitIds = new Set<string>(units.map((u: Partial<Property>) => u.id || '').filter((id: string) => id));
        
        // Remove units that are no longer in the list
        existingUnitIds.forEach((id: string) => {
            if (!newUnitIds.has(id)) {
                setProperties(prev => prev.filter(p => p.id !== id));
            }
        });
        
        // Add or update units
        units.forEach((unit, index) => {
            const unitProperty: Property = {
                id: unit.id || `${property.id}-unit-${index + 1}`,
                name: unit.name || '',
                unitNumber: unit.unitNumber || '',
                location: property.location,
                departmentId: property.departmentId,
                rentAmount: unit.rentAmount || 0,
                depositAmount: unit.depositAmount || 0,
                owner: property.owner,
                description: property.description,
                status: unit.status || PropertyStatus.Vacant,
                agentId: unit.agentId || '',
                images: [],
                documents: [],
                notes: unit.notes || '',
                propertyType: property.propertyType,
                unitType: unit.unitType,
                parentPropertyId: property.id,
                shopTenantInfo: unit.shopTenantInfo
            } as Property;
            
            // Check if this unit already exists
            const existingUnit = properties.find(p => p.id === unitProperty.id);
            if (existingUnit) {
                setProperties(prev => prev.map(p => p.id === unitProperty.id ? unitProperty : p));
            } else {
                setProperties(prev => [...prev, unitProperty]);
            }
        });
    }
    
    setIsFormModalOpen(false);
    setSelectedProperty(null);
  };
  
  const handleDeleteClick = (id: string) => {
    setPropertyToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (!propertyToDelete) return;

    const property = properties.find(p => p.id === propertyToDelete);
    if (!property) return;

    // Delete the property and all its units (if it's an Estate/Plaza)
    if (property.propertyType === PropertyType.Estate || property.propertyType === PropertyType.Plaza) {
      // Find all child units and delete them too
      const childUnits = properties.filter(p => p.parentPropertyId === property.id);
      childUnits.forEach(unit => {
        setProperties(prev => prev.filter(p => p.id !== unit.id));
      });
    }

    setProperties(prev => prev.filter(p => p.id !== propertyToDelete));
    addAuditLog('DELETED_PROPERTY', `Deleted property: ${property.name}`, property.id);
    setIsConfirmModalOpen(false);
    setPropertyToDelete(null);
  };

  const getStatusColor = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.Occupied: return 'bg-red-500/20 text-red-400';
      case PropertyStatus.Vacant: return 'bg-green-500/20 text-green-400';
      case PropertyStatus.UnderMaintenance: return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const openFormModal = (property: Property | null) => {
    setSelectedProperty(property);
    
    // If editing an Estate/Plaza, we need to pass existing units to the form
    // But we don't set them here - we pass them as a prop to PropertyForm
    
    setIsFormModalOpen(true);
  };

  const openDetailModal = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailModalOpen(true);
  };

  // Handler to update unit status
  const handleUpdateUnitStatus = (unitId: string, status: PropertyStatus) => {
    setProperties(prev => prev.map(p => {
      if (p.id === unitId) {
        return { ...p, status };
      }
      return p;
    }));
    addAuditLog('UPDATED_UNIT_STATUS', `Updated unit status to ${status}`, unitId);
  };

  // Handler to delete a unit
  const handleDeleteUnit = (unitId: string) => {
    const unit = properties.find(p => p.id === unitId);
    if (unit) {
      setProperties(prev => prev.filter(p => p.id !== unitId));
      addAuditLog('DELETED_UNIT', `Deleted unit: ${unit.name}`, unitId);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Properties</h2>
        {canManageGlobally && (
            <button onClick={() => openFormModal(null)} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">
              Add Property
            </button>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search by name or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-secondary p-2 rounded border border-border focus:ring-2 focus:ring-primary focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-secondary p-2 rounded border border-border focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="All">All Statuses</option>
          {Object.values(PropertyStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="bg-secondary p-2 rounded border border-border focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="All">All Agents</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>{agent.name}</option>
          ))}
        </select>
        <select
          value={propertyTypeFilter}
          onChange={(e) => setPropertyTypeFilter(e.target.value)}
          className="bg-secondary p-2 rounded border border-border focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="All">All Types</option>
          <option value="Standalone">Standalone</option>
          <option value="Estate">Estate</option>
          <option value="Plaza">Plaza</option>
        </select>
      </div>
      
      <div className="mb-4 flex items-center">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyParents}
            onChange={(e) => setShowOnlyParents(e.target.checked)}
            className="mr-2 w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-text-secondary">Show only Estates & Plazas</span>
        </label>
      </div>
      
      {/* Property List - Card view for Estates/Plazas with summary stats */}
      {showOnlyParents ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties
            .filter(p => p.propertyType === PropertyType.Estate || p.propertyType === PropertyType.Plaza)
            .map(prop => {
              const childUnits = properties.filter((p: Property) => p.parentPropertyId === prop.id);
              const totalUnits = childUnits.length;
              const occupiedUnits = childUnits.filter((u: Property) => u.status === PropertyStatus.Occupied).length;
              const vacantUnits = childUnits.filter((u: Property) => u.status === PropertyStatus.Vacant).length;
              const maintenanceUnits = childUnits.filter((u: Property) => u.status === PropertyStatus.UnderMaintenance).length;
              
              // Count tenants from both tenants list and shopTenantInfo
              const unitIds = childUnits.map((u: Property) => u.id);
              const tenantsInUnits = tenants.filter((t: Tenant) => unitIds.includes(t.propertyId));
              const unitsWithShopTenants = childUnits.filter((u: Property) => u.shopTenantInfo?.tenantName);
              const totalTenants = tenantsInUnits.length + unitsWithShopTenants.length;
              
              return (
                <div 
                  key={prop.id} 
                  className="bg-card rounded-lg shadow-lg border border-border p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => openDetailModal(prop)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{prop.name}</h3>
                      <p className="text-sm text-text-secondary">{prop.location}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        prop.propertyType === PropertyType.Estate ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {prop.propertyType === PropertyType.Estate ? 'Estate' : 'Plaza'}
                    </span>
                  </div>
                  
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-secondary/50 rounded p-2 text-center">
                      <div className="text-xl font-bold text-white">{totalUnits}</div>
                      <div className="text-xs text-text-secondary">Total Units</div>
                    </div>
                    <div className="bg-green-500/10 rounded p-2 text-center">
                      <div className="text-xl font-bold text-green-400">{vacantUnits}</div>
                      <div className="text-xs text-text-secondary">Vacant</div>
                    </div>
                    <div className="bg-red-500/10 rounded p-2 text-center">
                      <div className="text-xl font-bold text-red-400">{occupiedUnits}</div>
                      <div className="text-xs text-text-secondary">Occupied</div>
                    </div>
                    <div className="bg-yellow-500/10 rounded p-2 text-center">
                      <div className="text-xl font-bold text-yellow-400">{maintenanceUnits}</div>
                      <div className="text-xs text-text-secondary">Maintenance</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-border/50">
                    <span className="text-sm text-text-secondary">{totalTenants} Tenants</span>
                    <span className="text-green-400 text-sm font-medium">Click to view details</span>
                  </div>
                </div>
              );
            })}
          {filteredProperties.filter(p => p.propertyType === PropertyType.Estate || p.propertyType === PropertyType.Plaza).length === 0 && (
            <div className="col-span-full text-center p-6 text-text-secondary">
              No Estates or Plazas found. Create one by adding a property and selecting Estate or Plaza type.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-border">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Unit #</th>
              <th className="p-4">Location</th>
              <th className="p-4">Rent</th>
              <th className="p-4">Status</th>
              <th className="p-4">Agent</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProperties.map(prop => (
              <tr key={prop.id} className="border-b border-border/50 hover:bg-secondary">
                <td className="p-4">
                  {prop.parentPropertyId ? (
                    <span className="text-blue-400">{prop.name}</span>
                  ) : (
                    <span className="font-medium">{prop.name}</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    prop.propertyType === PropertyType.Estate ? 'bg-purple-500/20 text-purple-400' :
                    prop.propertyType === PropertyType.Plaza ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {prop.propertyType === PropertyType.Estate ? 'Estate' : 
                     prop.propertyType === PropertyType.Plaza ? 'Plaza' : 
                     prop.unitType ? prop.unitType : 'Standalone'}
                  </span>
                </td>
                <td className="p-4">{prop.unitNumber || '-'}</td>
                <td className="p-4">{prop.location}</td>
                <td className="p-4">₦{(prop.rentAmount || 0).toLocaleString()}</td>
                <td className="p-4">
                  <select 
                    value={prop.status}
                    onChange={(e) => {
                      setProperties(prev => prev.map(p => 
                        p.id === prop.id ? { ...p, status: e.target.value as PropertyStatus } : p
                      ));
                      addAuditLog('UPDATED_PROPERTY_STATUS', `Updated status to ${e.target.value}`, prop.id);
                    }}
                    className="bg-secondary p-1 rounded border border-border text-xs"
                  >
                    {Object.values(PropertyStatus).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4">{agents.find(a => a.id === prop.agentId)?.name || 'N/A'}</td>
                <td className="p-4 space-x-2 whitespace-nowrap">
                  <button onClick={() => openDetailModal(prop)} className="text-green-400 hover:text-green-300">View</button>
                  <button onClick={() => openFormModal(prop)} className="text-blue-400 hover:text-blue-300">Edit</button>
                  <button onClick={() => handleDeleteClick(prop.id)} className="text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
            {filteredProperties.length === 0 && (
                <tr>
                    <td colSpan={8} className="text-center p-6 text-text-secondary">No properties found matching your filters.</td>
                </tr>
            )}
          </tbody>
        </table>
        </div>
      )}

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedProperty ? 'Edit Property' : 'Add New Property'}>
        <PropertyForm 
            property={selectedProperty} 
            agents={agents}
            departments={departments}
            properties={properties}
            existingUnits={selectedProperty && (selectedProperty.propertyType === PropertyType.Estate || selectedProperty.propertyType === PropertyType.Plaza) 
                ? properties.filter(p => p.parentPropertyId === selectedProperty.id) 
                : []}
            onSave={handleSave} 
            onClose={() => setIsFormModalOpen(false)} 
        />
      </Modal>
      
       <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Property Details: ${selectedProperty?.name}`}>
        {selectedProperty && (
            <PropertyDetailModal
                property={selectedProperty}
                agentName={agents.find(a => a.id === selectedProperty.agentId)?.name || 'N/A'}
                departmentName={departments.find(d => d.id === selectedProperty.departmentId)?.name || 'N/A'}
                tenants={tenants}
                properties={properties}
                agents={agents}
                onEditProperty={(unit) => {
                    // When editing a unit, we need to open the form with the parent property
                    const parentProperty = properties.find(p => p.id === selectedProperty.id);
                    if (parentProperty) {
                        setIsDetailModalOpen(false);
                        openFormModal(parentProperty);
                    }
                }}
                onDeleteUnit={handleDeleteUnit}
                onUpdateUnitStatus={handleUpdateUnitStatus}
                onClose={() => setIsDetailModalOpen(false)}
            />
        )}
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this property? This action cannot be undone."
      />
    </div>
  );
};

export default Properties;
