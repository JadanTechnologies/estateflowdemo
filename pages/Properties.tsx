


import React, { useState, useMemo } from 'react';
import { Property, Agent, Department, PropertyStatus, User, Tenant, Permission, Role, AuditLogEntry, PropertyDocument } from '../types';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';

const PropertyForm: React.FC<{
    property: Partial<Property> | null;
    agents: Agent[];
    departments: Department[];
    onSave: (property: Property) => void;
    onClose: () => void;
}> = ({ property, agents, departments, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Property>>({
        name: '', unitNumber: '', location: '', departmentId: '', rentAmount: 0, depositAmount: 0, owner: '', status: PropertyStatus.Vacant, agentId: '', notes: '', images: [], documents: [],
        ...property
    });
    const [imageFiles, setImageFiles] = useState<FileList | null>(null);
    const [documentFiles, setDocumentFiles] = useState<FileList | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: ['rentAmount', 'depositAmount'].includes(name) ? Number(value) : value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
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

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name?.trim()) newErrors.name = "Property name is required.";
        if (!formData.location?.trim()) newErrors.location = "Location is required.";
        if (!formData.departmentId) newErrors.departmentId = "Department is required.";
        if ((formData.rentAmount ?? 0) <= 0) newErrors.rentAmount = "Rent amount must be a positive number.";
        if ((formData.depositAmount ?? 0) < 0) newErrors.depositAmount = "Deposit amount cannot be negative.";
        if (!formData.agentId) newErrors.agentId = "An agent must be assigned.";
        
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
        
        onSave({ id: property?.id || Date.now().toString(), ...formData, images: updatedImages, documents: updatedDocuments } as Property);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Property Name" className={`w-full bg-secondary p-2 rounded border ${errors.name ? 'border-red-500' : 'border-border'}`} required />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <input name="unitNumber" value={formData.unitNumber || ''} onChange={handleChange} placeholder="Unit Number (e.g., Apt 101)" className="w-full bg-secondary p-2 rounded border border-border" />
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
                    <input type="number" name="rentAmount" value={formData.rentAmount || 0} onChange={handleChange} placeholder="Rent Amount" className={`w-full bg-secondary p-2 rounded border ${errors.rentAmount ? 'border-red-500' : 'border-border'}`} required />
                    {errors.rentAmount && <p className="text-red-400 text-xs mt-1">{errors.rentAmount}</p>}
                </div>
                <div>
                    <input type="number" name="depositAmount" value={formData.depositAmount || 0} onChange={handleChange} placeholder="Deposit Amount" className={`w-full bg-secondary p-2 rounded border ${errors.depositAmount ? 'border-red-500' : 'border-border'}`} />
                    {errors.depositAmount && <p className="text-red-400 text-xs mt-1">{errors.depositAmount}</p>}
                </div>
                <input name="owner" value={formData.owner || ''} onChange={handleChange} placeholder="Owner" className="w-full bg-secondary p-2 rounded border border-border" />
                <select name="status" value={formData.status || PropertyStatus.Vacant} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border">
                    {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div>
                    <select name="agentId" value={formData.agentId || ''} onChange={handleChange} className={`w-full bg-secondary p-2 rounded border ${errors.agentId ? 'border-red-500' : 'border-border'}`} required>
                        <option value="">Assign Agent</option>
                        {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    {errors.agentId && <p className="text-red-400 text-xs mt-1">{errors.agentId}</p>}
                </div>
            </div>
            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Internal Notes" className="w-full bg-secondary p-2 rounded border border-border h-24"></textarea>
            
            {/* Images Upload */}
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

            {formData.images && formData.images.length > 0 && (
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

            {formData.documents && formData.documents.length > 0 && (
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
                <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Save Property</button>
            </div>
        </form>
    );
};

const PropertyDetailModal: React.FC<{
    property: Property;
    agentName: string;
    departmentName: string;
    tenants: Tenant[];
    onClose: () => void;
}> = ({ property, agentName, departmentName, tenants, onClose }) => {
    const propertyTenants = tenants.filter(t => t.propertyId === property.id);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
                    <div><strong>Unit:</strong> {property.unitNumber || 'N/A'}</div>
                    <div><strong>Location:</strong> {property.location}</div>
                    <div><strong>Department:</strong> {departmentName}</div>
                    <div><strong>Rent:</strong> ₦{(property.rentAmount || 0).toLocaleString()}</div>
                    <div><strong>Deposit:</strong> ₦{(property.depositAmount || 0).toLocaleString()}</div>
                    <div><strong>Owner:</strong> {property.owner}</div>
                    <div><strong>Status:</strong> {property.status}</div>
                    <div><strong>Agent:</strong> {agentName}</div>
                </div>
                {property.notes && <div className="mt-4"><strong>Notes:</strong> <p className="text-text-secondary italic bg-secondary p-2 rounded">{property.notes}</p></div>}
            </div>

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
                {propertyTenants.length > 0 ? (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary">
                            <tr>
                                <th className="p-2">Tenant Name</th>
                                <th className="p-2">Lease End Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {propertyTenants.map(tenant => (
                                <tr key={tenant.id} className="border-b border-border/50">
                                    <td className="p-2">{tenant.fullName}</td>
                                    <td className="p-2">{tenant.leaseEndDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-text-secondary italic">This property is currently vacant.</p>
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

  const userRole = useMemo(() => roles.find(r => r.id === currentUser.roleId), [roles, currentUser.roleId]);
  const canManageGlobally = userHasPermission(Permission.MANAGE_PROPERTIES);
  const canEditOwnProperty = userRole?.name === 'Agent' && userHasPermission(Permission.AGENT_CAN_EDIT_OWN_PROPERTIES);

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            property.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || property.status === statusFilter;
      const matchesAgent = agentFilter === 'All' || property.agentId === agentFilter;

      return matchesSearch && matchesStatus && matchesAgent;
    });
  }, [properties, searchQuery, statusFilter, agentFilter]);

  const handleSave = (property: Property) => {
    if (selectedProperty) {
      setProperties(prev => prev.map(p => p.id === property.id ? property : p));
      addAuditLog('UPDATED_PROPERTY', `Updated property: ${property.name}`, property.id);
    } else {
      setProperties(prev => [...prev, property]);
      addAuditLog('CREATED_PROPERTY', `Created property: ${property.name}`, property.id);
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

    if (property.status === PropertyStatus.Occupied) {
        alert("Cannot delete property. It is currently occupied by a tenant.");
        setIsConfirmModalOpen(false);
        setPropertyToDelete(null);
        return;
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
    setIsFormModalOpen(true);
  };

  const openDetailModal = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailModalOpen(true);
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

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>
      
      <div className="bg-card rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-border">
            <tr>
              <th className="p-4">Name</th>
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
                <td className="p-4">{prop.name}</td>
                <td className="p-4">{prop.location}</td>
                <td className="p-4">₦{(prop.rentAmount || 0).toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(prop.status)}`}>
                    {prop.status}
                  </span>
                </td>
                <td className="p-4">{agents.find(a => a.id === prop.agentId)?.name || 'N/A'}</td>
                <td className="p-4 space-x-2 whitespace-nowrap">
                  <button onClick={() => openDetailModal(prop)} className="text-green-400 hover:text-green-300">View</button>
                  {(canManageGlobally || (canEditOwnProperty && prop.agentId === currentUser.id)) && (
                    <button onClick={() => openFormModal(prop)} className="text-blue-400 hover:text-blue-300">Edit</button>
                  )}
                  {canManageGlobally && (
                      <button onClick={() => handleDeleteClick(prop.id)} className="text-red-400 hover:text-red-300">Delete</button>
                  )}
                </td>
              </tr>
            ))}
            {filteredProperties.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center p-6 text-text-secondary">No properties found matching your filters.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedProperty ? 'Edit Property' : 'Add New Property'}>
        <PropertyForm 
            property={selectedProperty} 
            agents={agents}
            departments={departments}
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
