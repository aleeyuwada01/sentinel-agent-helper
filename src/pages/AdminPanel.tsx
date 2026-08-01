import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Users, Plus, Search, Settings, Lock, UserCheck, UserX } from 'lucide-react';
import TopBar from '@/components/dashboard/TopBar';
import { systemUsers, SystemUser, UserRole, roleLabels, rolePermissions } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const roleColors: Record<UserRole, string> = {
  super_admin: 'bg-alert-red/15 text-alert-red border-alert-red/30',
  agency_admin: 'bg-primary/15 text-primary border-primary/30',
  state_coordinator: 'bg-alert-orange/15 text-alert-orange border-alert-orange/30',
  lga_officer: 'bg-alert-yellow/15 text-alert-yellow border-alert-yellow/30',
  focal_person: 'bg-alert-green/15 text-alert-green border-alert-green/30',
  viewer: 'bg-muted text-muted-foreground border-border',
};

const AdminPanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  const filtered = systemUsers.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !u.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowAddUser(false);
    toast.success('User created successfully', { description: 'Access credentials sent to email.' });
  };

  const handleToggleStatus = (user: SystemUser) => {
    toast.success(`User ${user.status === 'active' ? 'suspended' : 'activated'}`, {
      description: `${user.name} has been ${user.status === 'active' ? 'suspended' : 'reactivated'}.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-md hover:bg-secondary transition-colors">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Admin Panel
              </h1>
              <p className="text-xs text-muted-foreground">User management, roles & access control</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddUser(!showAddUser)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add User
          </button>
        </div>

        {/* Role Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(Object.keys(roleLabels) as UserRole[]).map(role => {
            const count = systemUsers.filter(u => u.role === role).length;
            return (
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setFilterRole(filterRole === role ? 'all' : role)}
                className={`data-grid cursor-pointer transition-all ${filterRole === role ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{roleLabels[role]}</span>
                </div>
                <p className="text-xl font-bold font-mono text-foreground">{count}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {rolePermissions[role][0]}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Add User Form */}
        {showAddUser && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="data-grid border border-primary/30">
            <h3 className="font-semibold text-sm text-foreground mb-4">Add New User</h3>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</label>
                  <input required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground" placeholder="Enter full name" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email</label>
                  <input type="email" required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground" placeholder="user@agency.gov.ng" />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Role</label>
                  <select required className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground">
                    {(Object.keys(roleLabels) as UserRole[]).map(r => (
                      <option key={r} value={r}>{roleLabels[r]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Agency (optional)</label>
                  <select className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground">
                    <option value="">None</option>
                    <option value="NIHSA">NIHSA</option>
                    <option value="NIMET">NiMet</option>
                    <option value="NEMA">NEMA</option>
                    {/* HIDDEN — uncomment to re-enable: */}
                    {/* <option value="NCDC">NCDC</option> */}
                    <option value="NOA">NOA</option>
                    {/* <option value="SEMA">SEMA</option> */}
                    {/* <option value="LEMA">LEMA</option> */}
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">State (optional)</label>
                  <input className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground" placeholder="State" />
                </div>
                <div className="flex gap-2 mt-6">
                  <button type="submit" className="flex-1 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    Create User
                  </button>
                  <button type="button" onClick={() => setShowAddUser(false)} className="px-4 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-secondary border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground"
              placeholder="Search users by name or email..."
            />
          </div>
          {filterRole !== 'all' && (
            <button onClick={() => setFilterRole('all')} className="text-[11px] text-primary hover:underline">
              Clear filter
            </button>
          )}
        </div>

        {/* Users List */}
        <div className="space-y-2">
          {filtered.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="data-grid"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${user.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-medium text-foreground">{user.name}</p>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-medium ${roleColors[user.role]}`}>
                        {roleLabels[user.role]}
                      </span>
                      {user.status === 'suspended' && (
                        <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono mt-0.5 flex-wrap">
                      <span>{user.email}</span>
                      {user.agency && <><span>•</span><span>{user.agency}</span></>}
                      {user.state && <><span>•</span><span>{user.state}</span></>}
                      <span>•</span>
                      <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                    className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                    title="View permissions"
                  >
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(user)}
                    className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                    title={user.status === 'active' ? 'Suspend user' : 'Activate user'}
                  >
                    {user.status === 'active'
                      ? <UserX className="h-3.5 w-3.5 text-alert-red" />
                      : <UserCheck className="h-3.5 w-3.5 text-alert-green" />
                    }
                  </button>
                </div>
              </div>
              {/* Expanded permissions */}
              {selectedUser?.id === user.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 pt-3 border-t border-border">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Permissions for {roleLabels[user.role]}</p>
                  <div className="flex flex-wrap gap-2">
                    {rolePermissions[user.role].map(perm => (
                      <span key={perm} className="px-2 py-1 rounded bg-muted text-[10px] text-foreground border border-border">
                        {perm}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
