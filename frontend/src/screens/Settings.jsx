import { Link } from 'react-router-dom';
import { 
  ArrowLeft, User, Shield, Key, History,
  Settings as SettingsIcon, Check, X, BarChart3
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import useAuthStore from '../store/authStore';

export default function Settings() {
  const { user } = useAuthStore();

  const permissions = [
    { name: 'View all products', granted: true },
    { name: 'Create/update job cards (GSTSAAS)', granted: true },
    { name: 'View financial reports', granted: true, note: 'read-only' },
    { name: 'Approve contracts', granted: false, note: 'requires AG_YAMA' },
    { name: 'Remote shutdown URGAA stations', granted: false, note: 'requires approval' },
  ];

  const auditLog = [
    { event: 'EVT_LOGIN_SUCCESS', timestamp: new Date().toISOString(), details: 'Logged in successfully' },
    { event: 'EVT_ASK_QUESTION', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Finance query' },
    { event: 'EVT_EXPORT_PDF', timestamp: new Date(Date.now() - 86400000).toISOString(), details: 'Job card JC-142' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]" data-testid="settings-page">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" data-testid="back-btn">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-poppins text-xl font-semibold text-white">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="roles" data-testid="tab-roles">
              <Shield className="w-4 h-4 mr-2" />
              Roles & Permissions
            </TabsTrigger>
            <TabsTrigger value="audit" data-testid="tab-audit">
              <History className="w-4 h-4 mr-2" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-6" data-testid="profile-card">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/50 text-sm mb-1">Name</p>
                    <p className="text-white font-medium">{user?.name || 'User'}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm mb-1">Email</p>
                    <p className="text-white font-medium">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm mb-1">Department</p>
                    <p className="text-white font-medium">{user?.department || 'DEPT_TECHNOLOGY'}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm mb-1">Role</p>
                    <Badge variant="teal">{user?.role || 'User'}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles & Permissions Tab */}
          <TabsContent value="roles">
            <Card className="p-6" data-testid="permissions-card">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Role Management</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="mb-6 p-4 bg-white/5 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/50">Current Role</p>
                      <p className="text-white font-medium">Admin</p>
                    </div>
                    <div>
                      <p className="text-white/50">Department</p>
                      <p className="text-white font-medium">{user?.department || 'DEPT_TECHNOLOGY'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-white/50">Chief Agent</p>
                      <p className="text-white font-medium">AG_VISHWAKARMA</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-white font-medium mb-4">Permissions</h3>
                <div className="space-y-3">
                  {permissions.map((perm, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-white/5" data-testid={`permission-${index}`}>
                      <div className="flex items-center gap-3">
                        {perm.granted ? (
                          <Check className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <X className="w-5 h-5 text-red-400" />
                        )}
                        <span className="text-white">{perm.name}</span>
                        {perm.note && (
                          <span className="text-white/40 text-sm">({perm.note})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <Card className="p-6" data-testid="audit-card">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-4">
                  {auditLog.map((log, index) => (
                    <div key={index} className="flex items-start gap-4 py-3 border-b border-white/5" data-testid={`audit-${index}`}>
                      <div className="w-2 h-2 rounded-full bg-[#FF6B35] mt-2" />
                      <div className="flex-1">
                        <p className="text-white font-mono text-sm">[{log.event}]</p>
                        <p className="text-white/60 text-sm">{log.details}</p>
                        <p className="text-white/40 text-xs mt-1">
                          {new Date(log.timestamp).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" className="mt-4 w-full" data-testid="view-full-log-btn">
                  View Full Log
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
