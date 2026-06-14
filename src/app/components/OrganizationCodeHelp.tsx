import { HelpCircle, Building2, Key, UserCheck, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';

export function OrganizationCodeHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          What's this?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Invitation Code
          </DialogTitle>
          <DialogDescription>
            Connect your account to your school or institution
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              If your school or institution provided you with an invitation code, enter it here to 
              link your account. This is <strong>optional</strong> but recommended for institutional users.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Benefits of Using an Organization Code:</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Institutional Connection</p>
                  <p className="text-sm text-muted-foreground">
                    Your account will be linked to your school or organization
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Centralized Management</p>
                  <p className="text-sm text-muted-foreground">
                    Institution administrators can view aggregated analytics and reports
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Collaboration</p>
                  <p className="text-sm text-muted-foreground">
                    Work with other teachers and staff from your institution
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Institutional Reporting</p>
                  <p className="text-sm text-muted-foreground">
                    Your data contributes to school-wide cognitive assessments and insights
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Key className="h-4 w-4" />
                How to Get a Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Organization invitation codes are provided by your school or institution's administrator. 
                The code format looks like: <code className="px-2 py-1 bg-muted rounded font-mono">JOTM-ABC123</code>
              </p>
              <p className="text-muted-foreground">
                If you don't have a code or your institution isn't registered yet, you can skip this step 
                and still use all JotMinds features. You can link your account later if needed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                How to Use the Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Enter the invitation code provided by your institution</li>
                <li>Click the "Verify" button to validate the code</li>
                <li>If valid, you'll see a confirmation with your institution's name</li>
                <li>Complete your registration - your account will be automatically linked</li>
              </ol>
            </CardContent>
          </Card>

          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> The organization code is completely optional. If you're an independent 
              teacher or don't have an institutional code, you can leave this field blank and still enjoy 
              the full JotMinds experience.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
