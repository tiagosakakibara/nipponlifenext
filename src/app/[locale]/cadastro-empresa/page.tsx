import { Metadata } from 'next';
import BusinessRegistrationForm from './BusinessRegistrationForm';

export const metadata: Metadata = {
    title: 'Cadastrar Empresa — NipponLife',
    description: 'Adicione sua empresa ao diretório NipponLife e alcance a comunidade brasileira no Japão.',
};

export default function CadastroEmpresaPage() {
    return <BusinessRegistrationForm />;
}
