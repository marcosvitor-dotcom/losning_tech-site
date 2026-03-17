import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Direitos Autorais — Health Mind",
  description: "Informações sobre propriedade intelectual, direitos autorais e licenciamento do Health Mind App.",
}

const CURRENT_YEAR = new Date().getFullYear()

export default function CopyrightPage() {
  return (
    <div className="hm-body" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--hm-border)",
        padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backgroundColor: "#fff",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Link href="/health-mind-app" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/health-mind-app/images/favicon.png" alt="Health Mind" width={32} height={32} style={{ borderRadius: 8 }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--hm-dark)" }}>Health Mind</span>
        </Link>
        <Link href="/health-mind-app" style={{ fontSize: 13, color: "var(--hm-text-muted)", textDecoration: "none" }}>
          ← Voltar
        </Link>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Título */}
        <div style={{ marginBottom: 40 }}>
          <h1 className="hm-heading" style={{ fontSize: 34, fontWeight: 800, color: "var(--hm-dark)", margin: "0 0 10px" }}>
            Direitos Autorais
          </h1>
          <p style={{ color: "var(--hm-text-muted)", fontSize: 15, lineHeight: 1.6 }}>
            Última atualização: março de {CURRENT_YEAR}
          </p>
        </div>

        {/* Seções */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

          {/* 1 – Titularidade */}
          <Section title="1. Titularidade dos Direitos">
            <p>
              O <strong>Health Mind</strong> é um produto desenvolvido e licenciado pela{" "}
              <strong>Losning Tech</strong> (CNPJ 55.767.736/0001-89), com sede em Brasília — DF, Brasil.
            </p>
            <p>
              Todo o conteúdo disponível no aplicativo e plataformas web relacionadas — incluindo, mas não se
              limitando a: código-fonte, design, logotipos, ícones, textos, ilustrações, sons, vídeos e
              funcionalidades — é de propriedade exclusiva da Losning Tech, protegido pelas leis brasileiras de
              direitos autorais (Lei nº 9.610/98) e pela legislação internacional aplicável.
            </p>
          </Section>

          {/* 2 – Marca */}
          <Section title="2. Marca e Identidade Visual">
            <p>
              O nome <strong>"Health Mind"</strong>, o logotipo, o ícone do aplicativo e quaisquer outros elementos
              de identidade visual associados são marcas registradas ou em processo de registro da Losning Tech.
            </p>
            <p>
              É proibido o uso não autorizado dessas marcas para fins comerciais, de marketing ou qualquer outra
              finalidade que possa causar confusão nos usuários ou denegrir a imagem da empresa.
            </p>
          </Section>

          {/* 3 – Licença de uso */}
          <Section title="3. Licença de Uso">
            <p>
              A Losning Tech concede ao usuário uma <strong>licença pessoal, não exclusiva, intransferível e
              revogável</strong> para utilizar o aplicativo e a plataforma estritamente para fins pessoais e
              profissionais de acordo com os Termos de Uso.
            </p>
            <p>Esta licença <strong>não autoriza</strong> o usuário a:</p>
            <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
              <li>Copiar, modificar, adaptar ou criar obras derivadas;</li>
              <li>Distribuir, sublicenciar, vender ou transferir o software;</li>
              <li>Realizar engenharia reversa, descompilar ou desmontar o código-fonte;</li>
              <li>Remover ou alterar avisos de propriedade intelectual.</li>
            </ul>
          </Section>

          {/* 4 – Conteúdo gerado pelo usuário */}
          <Section title="4. Conteúdo Gerado pelo Usuário">
            <p>
              Ao inserir dados, prontuários, relatórios ou qualquer outro conteúdo na plataforma, o usuário
              declara possuir os direitos necessários sobre esse conteúdo e concede à Losning Tech uma licença
              limitada para armazená-lo e processá-lo exclusivamente para prestação do serviço contratado.
            </p>
            <p>
              A Losning Tech <strong>não reivindica propriedade</strong> sobre o conteúdo clínico inserido por
              psicólogos ou clínicas. Tais dados pertencem aos respectivos profissionais e/ou pacientes, conforme
              a legislação vigente.
            </p>
          </Section>

          {/* 5 – Software de Terceiros */}
          <Section title="5. Licenças de Software de Terceiros">
            <p>
              O Health Mind utiliza componentes de software de código aberto ("open-source"), cada um sujeito às
              suas próprias licenças (MIT, Apache 2.0, BSD, entre outras). A Losning Tech cumpre integralmente os
              termos dessas licenças e disponibiliza os avisos de atribuição no código-fonte quando aplicável.
            </p>
            <p>
              Para uma lista completa dos componentes utilizados e suas respectivas licenças, entre em contato
              pelo e-mail{" "}
              <a href="mailto:legal@losningtech.com.br" style={{ color: "var(--hm-rose)" }}>
                legal@losningtech.com.br
              </a>
              .
            </p>
          </Section>

          {/* 6 – Inteligência Artificial */}
          <Section title="6. Funcionalidades de Inteligência Artificial">
            <p>
              As funcionalidades de inteligência artificial presentes no Health Mind são desenvolvidas pela
              Losning Tech com uso de modelos de linguagem licenciados de terceiros. Os prompts, fluxos de
              interação e personalizações do sistema de IA são propriedade intelectual da Losning Tech.
            </p>
            <p>
              As respostas geradas pela IA têm caráter de apoio e não substituem avaliação clínica profissional.
              A responsabilidade editorial e clínica pelo uso dessas informações é do profissional de saúde.
            </p>
          </Section>

          {/* 7 – Restrições */}
          <Section title="7. Usos Não Permitidos">
            <p>É expressamente proibido:</p>
            <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
              <li>Reproduzir total ou parcialmente o conteúdo sem autorização prévia por escrito;</li>
              <li>Utilizar o aplicativo para fins ilegais, fraudulentos ou prejudiciais a terceiros;</li>
              <li>Tentar obter acesso não autorizado a sistemas, servidores ou bases de dados;</li>
              <li>Usar robôs, scrapers ou outros meios automatizados para acessar o conteúdo;</li>
              <li>Criar produtos ou serviços concorrentes com base no código ou metodologia do Health Mind.</li>
            </ul>
          </Section>

          {/* 8 – DMCA / Denúncias */}
          <Section title="8. Denúncia de Violação de Direitos Autorais">
            <p>
              Se você acredita que algum conteúdo disponível na plataforma viola seus direitos autorais, entre
              em contato conosco com as seguintes informações:
            </p>
            <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
              <li>Identificação da obra protegida;</li>
              <li>Localização do conteúdo supostamente infrator na plataforma;</li>
              <li>Suas informações de contato;</li>
              <li>Declaração de boa-fé sobre a violação.</li>
            </ul>
            <p>
              Envie a notificação para:{" "}
              <a href="mailto:legal@losningtech.com.br" style={{ color: "var(--hm-rose)" }}>
                legal@losningtech.com.br
              </a>
            </p>
          </Section>

          {/* 9 – Atualizações */}
          <Section title="9. Alterações nesta Política">
            <p>
              A Losning Tech reserva-se o direito de atualizar este documento a qualquer momento. Alterações
              materiais serão comunicadas aos usuários por meio da plataforma ou por e-mail. O uso continuado
              do serviço após a publicação das alterações implica aceitação dos novos termos.
            </p>
          </Section>

          {/* 10 – Contato */}
          <Section title="10. Contato">
            <p>Para questões relacionadas a direitos autorais, propriedade intelectual ou licenciamento:</p>
            <div style={{ background: "var(--hm-rose-pale)", borderRadius: 12, padding: "16px 20px", marginTop: 8 }}>
              <div style={{ fontWeight: 700, color: "var(--hm-dark)", marginBottom: 8 }}>Losning Tech</div>
              <div style={{ fontSize: 14, color: "var(--hm-text)", lineHeight: 1.8 }}>
                CNPJ: 55.767.736/0001-89<br />
                Brasília — DF, Brasil<br />
                E-mail:{" "}
                <a href="mailto:legal@losningtech.com.br" style={{ color: "var(--hm-rose)" }}>
                  legal@losningtech.com.br
                </a>
                <br />
                Suporte:{" "}
                <a href="mailto:admin@losningtech.com" style={{ color: "var(--hm-rose)" }}>
                  admin@losningtech.com
                </a>
              </div>
            </div>
          </Section>
        </div>

        {/* Aviso final */}
        <div style={{
          marginTop: 48, textAlign: "center", padding: "24px",
          borderTop: "1px solid var(--hm-border)", color: "var(--hm-text-muted)", fontSize: 13,
        }}>
          © {CURRENT_YEAR} Health Mind · Todos os direitos reservados ·{" "}
          Desenvolvido e licenciado por{" "}
          <a href="/" style={{ color: "var(--hm-rose)", fontWeight: 600 }}>Losning Tech</a>
        </div>
      </main>

      {/* Footer nav */}
      <footer style={{ borderTop: "1px solid var(--hm-border)", padding: "20px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20, fontSize: 13, color: "var(--hm-text-muted)" }}>
          <Link href="/health-mind-app" style={{ color: "var(--hm-text-muted)", textDecoration: "none" }}>Home</Link>
          <Link href="/health-mind-app/privacy" style={{ color: "var(--hm-text-muted)", textDecoration: "none" }}>Privacidade</Link>
          <Link href="/health-mind-app/suporte" style={{ color: "var(--hm-text-muted)", textDecoration: "none" }}>Suporte</Link>
          <Link href="/health-mind-app/login" style={{ color: "var(--hm-text-muted)", textDecoration: "none" }}>Área de Acesso</Link>
        </div>
      </footer>
    </div>
  )
}

// ─── Section component ────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{
        fontSize: 18, fontWeight: 700, color: "var(--hm-dark)",
        marginBottom: 12, paddingBottom: 8,
        borderBottom: "2px solid var(--hm-rose-soft)",
      }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, color: "var(--hm-text)", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </div>
    </section>
  )
}
