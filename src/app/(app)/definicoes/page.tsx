import { Save } from "lucide-react";

import { DemoNotice } from "@/components/shared/demo-notice";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Definições"
        description="Gere os dados básicos da conta e preferências do produto."
      />
      <DemoNotice>
        Estas opções são apenas uma pré-visualização. Serão ligadas ao perfil do
        utilizador depois da autenticação.
      </DemoNotice>
      <Card>
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">Perfil</h2>
            <p className="mt-1 text-sm text-slate-500">
              Informação apresentada na aplicação.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <FormField label="Nome" htmlFor="profile-name">
            <input
              id="profile-name"
              defaultValue="Utilizador"
              className={fieldClassName}
            />
          </FormField>
          <FormField label="Email" htmlFor="profile-email">
            <input
              id="profile-email"
              type="email"
              defaultValue="utilizador@exemplo.pt"
              className={fieldClassName}
            />
          </FormField>
          <FormField label="Idioma" htmlFor="profile-language">
            <select
              id="profile-language"
              defaultValue="pt-PT"
              className={fieldClassName}
            >
              <option value="pt-PT">Português (Portugal)</option>
            </select>
          </FormField>
          <FormField label="Formato de data" htmlFor="date-format">
            <select
              id="date-format"
              defaultValue="dd/MM/yyyy"
              className={fieldClassName}
            >
              <option value="dd/MM/yyyy">DD/MM/AAAA</option>
            </select>
          </FormField>
          <div className="md:col-span-2 flex justify-end">
            <Button disabled title="Disponível depois da autenticação">
              <Save aria-hidden="true" className="size-4" />
              Guardar alterações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
