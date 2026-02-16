import { PrivacyPolicyContent } from "@/components/privacy-policy-content";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in-up">
      <h1 className="text-4xl font-bold font-headline mb-8 text-foreground">Politique de Confidentialité</h1>
      <PrivacyPolicyContent />
    </div>
  );
}
