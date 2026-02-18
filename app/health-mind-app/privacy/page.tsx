import Image from "next/image"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidade — Health Mind App",
  description:
    "Política de privacidade do Health Mind App, produto desenvolvido e mantido pela Losning Tech. Conformidade com a LGPD (Lei nº 13.709/2018).",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Health Mind App"
            width={40}
            height={40}
            className="rounded-xl"
          />
          <div>
            <p className="text-xs text-gray-400 leading-none">by Losning Tech</p>
            <p className="text-sm font-semibold text-gray-700 leading-tight">Health Mind App</p>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Título */}
        <div className="mb-10 pb-8 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Política de Privacidade
          </h1>
          <p className="text-sm text-gray-500">Última atualização: Fevereiro de 2026</p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            O <strong>Health Mind App</strong> é um produto desenvolvido, licenciado e mantido pela{" "}
            <strong>Losning Tech</strong> (CNPJ: 61.661.169/0001-87). A Losning Tech se compromete
            com a proteção dos dados pessoais de seus usuários, em conformidade com a{" "}
            <strong>Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD)</strong>.
          </p>
        </div>

        <div className="space-y-10 text-gray-700">

          {/* 1 */}
          <Section number="1" title="Dados Coletados">
            <SubSection title="1.1. Dados de Cadastro:">
              <ul>
                <li>Nome completo, e-mail, telefone, CPF <em>(pacientes)</em></li>
                <li>CRP, formação acadêmica, especializações <em>(psicólogos)</em></li>
                <li>CNPJ, endereço, dados do responsável <em>(clínicas)</em></li>
              </ul>
            </SubSection>
            <SubSection title="1.2. Dados de Uso:">
              <ul>
                <li>Registros de agendamentos e consultas</li>
                <li>Conversas com a assistente terapêutica digital</li>
                <li>Histórico de acesso e navegação na plataforma</li>
              </ul>
            </SubSection>
            <SubSection title="1.3. Dados Sensíveis:">
              <ul>
                <li>Informações relacionadas à saúde mental compartilhadas nas conversas</li>
                <li>Registros de sessões e anotações terapêuticas</li>
                <li>Contato de emergência</li>
              </ul>
            </SubSection>
          </Section>

          {/* 2 */}
          <Section number="2" title="Finalidade do Tratamento">
            <p>Os dados pessoais são tratados para as seguintes finalidades:</p>
            <AlphaList items={[
              "Prestação dos serviços da plataforma (agendamento, registro, comunicação)",
              "Personalização da assistente terapêutica digital",
              "Segurança e prevenção de fraudes",
              "Cumprimento de obrigações legais e regulatórias",
              "Comunicação com o usuário sobre o serviço",
            ]} />
          </Section>

          {/* 3 */}
          <Section number="3" title="Base Legal (LGPD — Art. 7)">
            <p>O tratamento de dados pessoais no Health Mind App se fundamenta nas seguintes bases legais:</p>
            <AlphaList items={[
              "Consentimento do titular (Art. 7, I) — para dados sensíveis de saúde",
              "Execução de contrato (Art. 7, V) — para prestação dos serviços",
              "Exercício regular de direitos (Art. 7, VI) — para registros profissionais",
              "Proteção da vida (Art. 7, VII) — para protocolos de emergência",
              "Tutela da saúde (Art. 7, VIII) — para acompanhamento terapêutico",
            ]} />
          </Section>

          {/* 4 */}
          <Section number="4" title="Compartilhamento de Dados">
            <SubSection title="4.1. Dados de pacientes são compartilhados exclusivamente com:">
              <ul>
                <li>O psicólogo responsável pelo acompanhamento</li>
                <li>A clínica vinculada (dados administrativos apenas)</li>
                <li>Serviços de emergência, quando acionado o protocolo de risco</li>
              </ul>
            </SubSection>
            <p className="mt-3">
              <strong>4.2.</strong> Não compartilhamos dados pessoais com terceiros para fins comerciais ou publicitários.
            </p>
            <p className="mt-3">
              <strong>4.3.</strong> Podemos compartilhar dados anonimizados e agregados para fins estatísticos e de melhoria do serviço.
            </p>
          </Section>

          {/* 5 */}
          <Section number="5" title="Armazenamento e Segurança">
            <NumberedList items={[
              "Os dados são armazenados em servidores seguros com criptografia AES-256 para dados sensíveis.",
              "Senhas são armazenadas utilizando hash criptográfico (bcrypt), impossibilitando sua recuperação em texto puro.",
              "A comunicação entre o aplicativo e o servidor é protegida por HTTPS/TLS.",
              "Realizamos backups regulares e mantemos controles de acesso rigorosos.",
              "Em caso de incidente de segurança, os titulares afetados e a Autoridade Nacional de Proteção de Dados (ANPD) serão notificados conforme Art. 48 da LGPD.",
            ]} prefix="5" />
          </Section>

          {/* 6 */}
          <Section number="6" title="Direitos do Titular">
            <p>De acordo com a LGPD, você tem direito a:</p>
            <AlphaList items={[
              "Confirmação da existência de tratamento de seus dados",
              "Acesso aos dados pessoais tratados",
              "Correção de dados incompletos, inexatos ou desatualizados",
              "Anonimização, bloqueio ou eliminação de dados desnecessários",
              "Portabilidade dos dados a outro fornecedor",
              "Eliminação dos dados pessoais tratados com consentimento",
              "Informação sobre compartilhamento de dados",
              "Revogação do consentimento",
            ]} />
            <p className="mt-4 text-sm bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              Para exercer seus direitos, entre em contato pelo telefone{" "}
              <a href="tel:+5561983730910" className="text-blue-600 font-medium hover:underline">
                (61) 98373-0910
              </a>{" "}
              ou acesse{" "}
              <a
                href="https://www.losningtech.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium hover:underline"
              >
                www.losningtech.com.br
              </a>
              .
            </p>
          </Section>

          {/* 7 */}
          <Section number="7" title="Retenção de Dados">
            <NumberedList items={[
              "Dados de cadastro: mantidos enquanto a conta estiver ativa.",
              "Registros terapêuticos: mantidos pelo período mínimo de 5 (cinco) anos após o encerramento do acompanhamento, conforme Resolução CFP nº 001/2009.",
              "Dados de acesso e logs: mantidos por 6 (seis) meses para fins de segurança.",
            ]} prefix="7" />
          </Section>

          {/* 8 */}
          <Section number="8" title="Cookies e Tecnologias de Rastreamento">
            <NumberedList items={[
              "O aplicativo utiliza tokens de autenticação (JWT) para manter a sessão do usuário.",
              "Não utilizamos cookies de rastreamento ou publicidade.",
            ]} prefix="8" />
          </Section>

          {/* 9 */}
          <Section number="9" title="Controlador de Dados e Contato">
            <p>A <strong>Losning Tech</strong> é a controladora dos dados pessoais tratados pelo Health Mind App.</p>
            <p className="mt-3">Para questões relacionadas à proteção de dados pessoais:</p>
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-2 text-sm">
              <Row label="Empresa" value="Losning Tech" />
              <Row label="CNPJ" value="61.661.169/0001-87" />
              <Row label="Telefone" value="(61) 98373-0910" link="tel:+5561983730910" />
              <Row label="Site" value="www.losningtech.com.br" link="https://www.losningtech.com.br" />
              <Row label="Endereço" value="Brasília/DF" />
            </div>
          </Section>

          {/* 10 */}
          <Section number="10" title="Alterações nesta Política">
            <p>
              Esta Política de Privacidade pode ser atualizada periodicamente. Notificaremos os
              usuários sobre mudanças significativas por meio do aplicativo ou e-mail cadastrado.
            </p>
          </Section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Health Mind" width={28} height={28} className="rounded-lg" />
            <span className="text-sm text-gray-500">
              © {new Date().getFullYear()} Losning Tech. Todos os direitos reservados.
            </span>
          </div>
          <a
            href="/"
            className="text-sm text-blue-600 hover:underline"
          >
            Voltar ao site
          </a>
        </div>
      </footer>
    </div>
  )
}

/* ── Componentes auxiliares ── */

function Section({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {number}. {title}
      </h2>
      <div className="space-y-3 leading-relaxed">{children}</div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-gray-800 mb-2">{title}</p>
      <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">{children}</ul>
    </div>
  )
}

function AlphaList({ items }: { items: string[] }) {
  const letters = "abcdefghijklmnopqrstuvwxyz"
  return (
    <ul className="mt-2 space-y-1 ml-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="font-medium text-gray-500 shrink-0">{letters[i]})</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function NumberedList({ items, prefix }: { items: string[]; prefix: string }) {
  return (
    <ul className="space-y-2 ml-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="font-medium text-gray-500 shrink-0">{prefix}.{i + 1}.</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Row({
  label,
  value,
  link,
}: {
  label: string
  value: string
  link?: string
}) {
  return (
    <div className="flex gap-2">
      <span className="font-medium text-gray-600 w-24 shrink-0">{label}:</span>
      {link ? (
        <a href={link} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      ) : (
        <span className="text-gray-700">{value}</span>
      )}
    </div>
  )
}
