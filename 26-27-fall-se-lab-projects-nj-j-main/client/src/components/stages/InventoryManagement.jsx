import React, { useState } from 'react';
import {
  Boxes,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  PackagePlus,
  ArrowRightLeft,
  Search,
  ShoppingCart,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InventoryManagement = () => {
  const {
    inventory,
    purchaseRequests,
    createPurchaseRequest,
    receivePurchaseOrder,
    transferStock,
    materialReservations,
    excessStock,
    activeSubTab,
    setActiveSubTab
  } = useApp();

  const currentSubTab = activeSubTab || 'raw_stock';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPoModal, setShowPoModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // New PO form state
  const [poItemId, setPoItemId] = useState(inventory[0]?.id || '');
  const [poQty, setPoQty] = useState(30);
  const [poSupplier, setPoSupplier] = useState('TechNova Imaging Systems');

  // Transfer form state
  const [transferItemId, setTransferItemId] = useState(inventory[0]?.id || '');
  const [fromBranch, setFromBranch] = useState('Main Press');
  const [toBranch, setToBranch] = useState('Branch 2 (Peenya)');
  const [transferQty, setTransferQty] = useState(10);

  const categories = ['All', 'Paper', 'Plate', 'Ink', 'Finishing', 'Chemical'];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const lowStockCount = inventory.filter(i => i.quantity_on_hand <= i.reorder_threshold).length;

  const handleCreatePo = (e) => {
    e.preventDefault();
    const item = inventory.find(i => i.id === poItemId);
    createPurchaseRequest({
      inventory_item_id: poItemId,
      item_name: item?.name || 'Raw Material',
      requested_qty: Number(poQty),
      supplier_name: poSupplier,
      estimated_cost: (item?.unit_cost || 500) * Number(poQty),
    });
    setShowPoModal(false);
  };

  const handleExecuteTransfer = (e) => {
    e.preventDefault();
    transferStock(transferItemId, fromBranch, toBranch, Number(transferQty));
    setShowTransferModal(false);
  };

  const subTabs = [
    {
      id: 'raw_stock',
      label: 'Raw Stock Levels',
      icon: Boxes,
      badge: `${inventory.length} SKUs`,
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'offcuts',
      label: 'Offcuts & Excess',
      icon: Layers,
      badge: `${excessStock?.length || 2} Lots`,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'purchase_orders',
      label: 'Supplier PO Procurement',
      icon: ShoppingCart,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : `${purchaseRequests.length} POs`,
      badgeColor: lowStockCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-700'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Consolidated Module Header with Sub-Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#001523] text-white flex items-center justify-center font-bold text-sm shadow-xs font-mono">
              07
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Inventory & Stores</h1>
          </div>

          {/* Sub-Tab Navigation Bar */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 text-xs">
            {subTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = currentSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#001523] font-bold shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-blue-600' : 'text-slate-500'} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${tab.badgeColor}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="stage-page-container">
        {/* Actions Bar */}
        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">
            {currentSubTab === 'offcuts'
              ? 'Offcut lot inventory recovered from press runs and post-press trimming'
              : currentSubTab === 'purchase_orders'
              ? 'Purchase orders issued to paper mills and consumables distributors'
              : 'Real-time inventory levels across Ramamurthy Nagar, Byrathi & Kalkere warehouse facilities'}
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary text-xs" onClick={() => setShowTransferModal(true)}>
              <ArrowRightLeft size={14} /> Inter-Branch Transfer
            </button>
            <button className="btn btn-primary text-xs" onClick={() => setShowPoModal(true)}>
              <ShoppingCart size={14} /> Create Purchase Order (PO)
            </button>
          </div>
        </div>

        {/* Low Stock Warning Banner */}
        {lowStockCount > 0 && currentSubTab !== 'offcuts' && (
          <div className="warning-banner-card">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-warning animate-bounce" />
              <div>
                <span className="font-bold text-sm">Low Stock Alert ({lowStockCount} items below minimum safety threshold):</span>
                <p className="text-xs text-muted">
                  Immediate purchase order recommended to prevent offset press downtime.
                </p>
              </div>
            </div>
            <button className="btn btn-xs btn-warning" onClick={() => setShowPoModal(true)}>
              Auto-Generate POs
            </button>
          </div>
        )}

        {/* Offcuts & Excess Tab View */}
        {currentSubTab === 'offcuts' && (
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-amber-600" />
                <h3 className="card-title">Offcuts & Excess Finished Stock Register</h3>
              </div>
              <span className="text-xs font-mono text-slate-500 font-bold">
                {excessStock?.length || 2} Lots Catalogued
              </span>
            </div>

            <div className="table-responsive">
              <table className="standard-table">
                <thead>
                  <tr>
                    <th>Job Ticket No</th>
                    <th>Substrate / Item Description</th>
                    <th className="text-right">Quantity</th>
                    <th>Bin Location</th>
                    <th>Handed Off By</th>
                    <th>Reuse Classification & Notes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(excessStock || []).map(ex => (
                    <tr key={ex.id}>
                      <td className="font-mono font-bold text-blue-700">{ex.job_ticket_number}</td>
                      <td className="font-medium text-slate-900">{ex.product_name}</td>
                      <td className="text-right font-bold text-sm font-mono text-slate-800">{ex.quantity}</td>
                      <td className="font-mono text-xs text-slate-600">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-semibold">
                          {ex.bin_location}
                        </span>
                      </td>
                      <td className="text-xs text-slate-600">{ex.handed_off_by}</td>
                      <td className="text-xs text-slate-500 max-w-md">{ex.reuse_notes}</td>
                      <td>
                        <span className="badge badge-success">{ex.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Raw Stock Levels or PO Tab View */}
        {currentSubTab !== 'offcuts' && (
      <div className="inventory-main-layout">
        {/* Left: Inventory Grid */}
        <div className="card flex-1">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <h3 className="card-title flex items-center gap-2">
                <Boxes size={18} className="text-primary" /> Warehouse Stock Balances
              </h3>
              <div className="category-filter-pills">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="search-input-box">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search SKU or item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="standard-table">
              <thead>
                <tr>
                  <th>SKU & Item Name</th>
                  <th>Category</th>
                  <th>Warehouse Location</th>
                  <th className="text-right">On Hand</th>
                  <th className="text-right">Min Threshold</th>
                  <th className="text-right">Unit Rate</th>
                  <th>Stock Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => {
                  const isLow = item.quantity_on_hand <= item.reorder_threshold;
                  const isCritical = item.quantity_on_hand < item.reorder_threshold / 2;

                  return (
                    <tr key={item.id} className={isLow ? 'low-stock-row' : ''}>
                      <td>
                        <div className="font-semibold text-sm">{item.name}</div>
                        <span className="sku-tag">{item.sku}</span>
                      </td>
                      <td>
                        <span className={`category-badge cat-${item.category?.toLowerCase()}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="text-xs text-muted font-medium">{item.branch_location}</td>
                      <td className="text-right font-bold text-sm">
                        {item.quantity_on_hand} <span className="text-xs font-normal text-muted">{item.unit_of_measure}</span>
                      </td>
                      <td className="text-right text-xs font-semibold text-muted">
                        {item.reorder_threshold} {item.unit_of_measure}
                      </td>
                      <td className="text-right font-medium">₹{item.unit_cost?.toLocaleString()}</td>
                      <td>
                        {isCritical ? (
                          <span className="badge badge-danger">[CRITICAL LOW]</span>
                        ) : isLow ? (
                          <span className="badge badge-warning">[REORDER]</span>
                        ) : (
                          <span className="badge badge-success">[HEALTHY]</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          className="btn btn-xs btn-secondary"
                          onClick={() => {
                            setPoItemId(item.id);
                            setPoSupplier(item.supplier_name);
                            setShowPoModal(true);
                          }}
                        >
                          + PO
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Purchase Orders & Material Reservations */}
        <div className="card w-1/3">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <ShoppingCart size={18} className="text-primary" /> Purchase Orders & Inward GRN
            </h3>
          </div>

          <div className="po-list-wrapper">
            {purchaseRequests.map(po => {
              const isReceived = po.status === 'Received';
              return (
                <div key={po.id} className="po-card-item">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-primary">{po.po_number}</span>
                    <span className={`status-pill status-${isReceived ? 'approved' : 'pending'}`}>
                      {po.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs mt-1">{po.item_name}</h4>
                  <div className="text-xs text-muted">
                    Qty: <strong>{po.requested_qty}</strong> | Supplier: <strong>{po.supplier_name}</strong>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-bold">Est: ₹{po.estimated_cost?.toLocaleString()}</span>
                    {!isReceived && (
                      <button
                        className="btn btn-xs btn-success flex items-center gap-1"
                        onClick={() => receivePurchaseOrder(po.id)}
                      >
                        <CheckCircle2 size={12} /> Receive Goods (GRN)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <hr className="my-3" />

          {/* Material Allocations for Active Jobs */}
          <div className="card-header p-0 mb-2">
            <h4 className="text-xs font-bold text-muted flex items-center gap-1">
              <Layers size={14} /> ACTIVE JOB MATERIAL RESERVATIONS
            </h4>
          </div>
          <div className="reservations-list">
            {materialReservations.map(res => (
              <div key={res.id} className="reservation-item text-xs">
                <div className="flex justify-between">
                  <span className="font-medium">{res.item_name}</span>
                  <span className={res.is_deducted ? 'text-success font-bold' : 'text-warning font-bold'}>
                    {res.is_deducted ? 'Deducted' : 'Reserved'}
                  </span>
                </div>
                <div className="text-xxs text-muted">
                  Reserved: {res.quantity_reserved} | Deducted: {res.quantity_deducted}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>

      {/* Purchase Order Modal */}
      {showPoModal && (
        <div className="modal-backdrop" onClick={() => setShowPoModal(false)}>
          <div className="modal-container max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Supplier Purchase Order (PO)</h3>
              <button className="modal-close-btn" onClick={() => setShowPoModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreatePo} className="p-4">
              <div className="form-group">
                <label>Select Item to Reorder:</label>
                <select
                  className="form-control"
                  value={poItemId}
                  onChange={(e) => {
                    setPoItemId(e.target.value);
                    const item = inventory.find(i => i.id === e.target.value);
                    if (item) setPoSupplier(item.supplier_name);
                  }}
                >
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Stock: {i.quantity_on_hand} {i.unit_of_measure})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Order Quantity:</label>
                <input
                  type="number"
                  className="form-control font-bold"
                  value={poQty}
                  onChange={(e) => setPoQty(Number(e.target.value))}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Supplier / Mill Name:</label>
                <input
                  type="text"
                  className="form-control"
                  value={poSupplier}
                  onChange={(e) => setPoSupplier(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions-footer mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPoModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {showTransferModal && (
        <div className="modal-backdrop" onClick={() => setShowTransferModal(false)}>
          <div className="modal-container max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Inter-Branch Stock Transfer Note</h3>
              <button className="modal-close-btn" onClick={() => setShowTransferModal(false)}>✕</button>
            </div>
            <form onSubmit={handleExecuteTransfer} className="p-4">
              <div className="form-group">
                <label>Select Material to Transfer:</label>
                <select
                  className="form-control"
                  value={transferItemId}
                  onChange={(e) => setTransferItemId(e.target.value)}
                >
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Available: {i.quantity_on_hand})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>From Location:</label>
                  <select className="form-control" value={fromBranch} onChange={(e) => setFromBranch(e.target.value)}>
                    <option value="Main Press">Main Press (Peenya)</option>
                    <option value="Branch 2 (Peenya)">Branch 2 (Warehouse)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>To Location:</label>
                  <select className="form-control" value={toBranch} onChange={(e) => setToBranch(e.target.value)}>
                    <option value="Branch 2 (Peenya)">Branch 2 (Warehouse)</option>
                    <option value="Main Press">Main Press (Peenya)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Transfer Quantity:</label>
                <input
                  type="number"
                  className="form-control"
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  min="1"
                  required
                />
              </div>

              <div className="modal-actions-footer mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTransferModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Stock Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
