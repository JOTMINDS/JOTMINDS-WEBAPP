const fs = require('fs');
const path = 'src/app/components/AdminPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add createClient import
if (!content.includes('../utils/supabase/client')) {
    content = content.replace("import { getAllUsers", "import { createClient } from '../utils/supabase/client';\nimport { getAllUsers");
}

// 2. Remove onViewUserDashboard from AdminPanelProps
content = content.replace("  onViewUserDashboard: (userId: string) => void;\n", "");
content = content.replace("export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, onLogout, onViewUserDashboard }) => {", "export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, onLogout }) => {");

// 3. Update the data fetching in useEffect to use Supabase directly
const oldFetch = `        console.log('[AdminPanel] Calling getAllUsers()...');
        const usersData = await getAllUsers();
        console.log('[AdminPanel] Users data received:', usersData);`;
        
const newFetch = `        console.log('[AdminPanel] Fetching users directly from Supabase...');
        const supabase = createClient();
        const { data: usersData, error: usersError } = await supabase.from('users').select('*');
        
        if (usersError) {
            console.error('[AdminPanel] Supabase fetch error:', usersError);
        } else {
            console.log('[AdminPanel] Supabase users received:', usersData?.length);
        }
        
        // Use Supabase data if available, fallback to api.ts if table doesn't exist
        const finalUsers = usersData || (await getAllUsers()).users;`;
        
content = content.replace(oldFetch, newFetch);
content = content.replace("setUsers(usersData.users || []);", "setUsers(finalUsers || []);");

// 4. Implement toggle functionality inside AdminPanel
const stateDeclarations = "  const [selectedSector, setSelectedSector] = useState<string>('all');";
const functions = `  const supabase = createClient();

  const toggleUserActivation = async (userId: string, currentStatus: boolean | undefined) => {
    try {
        const newStatus = currentStatus === undefined ? false : !currentStatus;
        
        // Optimistic UI update
        setUsers(users.map(u => u.id === userId ? { ...u, isActive: newStatus } : u));
        
        // Update Supabase
        const { error } = await supabase
            .from('users')
            .update({ isActive: newStatus })
            .eq('id', userId);
            
        if (error) throw error;
    } catch (err) {
        console.error('Failed to toggle activation:', err);
        // Revert optimistic update
        const { data } = await supabase.from('users').select('*');
        if (data) setUsers(data);
    }
  };

  const updateSubscription = async (userId: string, status: string) => {
    try {
        // Optimistic UI update
        setUsers(users.map(u => u.id === userId ? { ...u, subscriptionStatus: status } : u));
        
        // Update Supabase
        const { error } = await supabase
            .from('users')
            .update({ subscriptionStatus: status })
            .eq('id', userId);
            
        if (error) throw error;
    } catch (err) {
        console.error('Failed to update subscription:', err);
        // Revert optimistic update
        const { data } = await supabase.from('users').select('*');
        if (data) setUsers(data);
    }
  };`;
content = content.replace(stateDeclarations, stateDeclarations + "\n\n" + functions);

// 5. Update the Table Head in User Directory
const oldTableHead = `<TableHead>Industry Sector</TableHead>
                    <TableHead className="text-right">Actions</TableHead>`;
const newTableHead = `<TableHead>Industry Sector</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead className="text-right">Manage</TableHead>`;
content = content.replace(oldTableHead, newTableHead);

// 6. Update the Table Row rendering for actions
const oldTableRow = `                        <TableCell className="text-sm text-gray-600">
                          {user.industrySector || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewUserDashboard(user.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Dashboard
                          </Button>
                        </TableCell>`;
const newTableRow = `                        <TableCell className="text-sm text-gray-600">
                          {user.industrySector || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.isActive !== false ? "default" : "destructive"}
                            className={user.isActive !== false ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {user.isActive !== false ? 'Active' : 'Deactivated'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={user.subscriptionStatus || 'active'} 
                            onValueChange={(val) => updateSubscription(user.id, val)}
                          >
                            <SelectTrigger className="w-[120px] h-8 text-xs">
                              <SelectValue placeholder="Subscription" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="trial">Trial</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserActivation(user.id, user.isActive)}
                            className={user.isActive !== false ? "text-red-500 border-red-200 hover:bg-red-50" : "text-green-500 border-green-200 hover:bg-green-50"}
                          >
                            {user.isActive !== false ? 'Deactivate' : 'Activate'}
                          </Button>
                        </TableCell>`;
content = content.replace(oldTableRow, newTableRow);

fs.writeFileSync(path, content);
