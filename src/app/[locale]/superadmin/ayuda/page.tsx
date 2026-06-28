import { setRequestLocale } from "next-intl/server";
import {
  QrCode,
  Upload,
  ShieldCheck,
  Images,
  Tv,
  ShoppingBag,
  Printer,
  Palette,
  Bot,
  CreditCard,
  LayoutTemplate,
  FileText,
  Download,
  Users,
  ScrollText,
  LifeBuoy,
  Mail,
  CalendarDays,
} from "lucide-react";
import { requireRole } from "@/server/auth/guards";
import { SuperHeader } from "@/components/admin/SuperHeader";
import { buttonClass } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

// Contacto de soporte (desarrollo). Cambiar aquí si procede.
const SUPPORT_EMAIL = "lopez@karaokemedia.com";
const DEVELOPER = "Novaura Group LLC";

type Item = { icon: React.ElementType; title: string; what: string; where: string };

const SECTIONS: { group: string; items: Item[] }[] = [
  {
    group: "Para el público (asistentes)",
    items: [
      { icon: QrCode, title: "Acceso por QR", what: "Cada evento tiene un QR único de acceso. Al escanearlo, el asistente llega a la web para subir y ver fotos.", where: "Superadmin → Eventos (QR de acceso por evento)" },
      { icon: Upload, title: "Subir fotos", what: "El asistente elige su escenario y sube fotos desde el móvil. Debe aceptar la cesión de derechos y ser mayor de edad. Toda foto entra como PENDIENTE.", where: "Web pública → Elige tu escenario → Subir" },
      { icon: Images, title: "Galería pública", what: "Solo se muestran fotos APROBADAS, con filtros por escenario y día, scroll infinito y destacadas.", where: "Web pública → Galería" },
      { icon: ShoppingBag, title: "Conseguir / imprimir foto", what: "Según el evento: descarga gratuita o de pago. En modo pago se muestra el código de la foto para localizarla e imprimirla.", where: "Web pública → Foto → Conseguir / imprimir" },
      { icon: LifeBuoy, title: "Mis fotos", what: "El asistente puede volver a ver las fotos que subió desde su dispositivo (incluye las que siguen en revisión).", where: "Web pública → Mis fotos" },
    ],
  },
  {
    group: "Operación del festival",
    items: [
      { icon: ShieldCheck, title: "Moderación (IA + manual)", what: "Cola de aprobación con apoyo de IA. Aprobar, rechazar, destacar y enviar a pantalla. Swipe en móvil. Toda acción se audita.", where: "Panel → Moderación" },
      { icon: Tv, title: "TV en directo", what: "Pantalla del recinto con 5 plantillas (clásicas y dinámicas), previsualización en vivo, cadencia y enlace de pantalla. Muestra el código y QR para subir.", where: "Superadmin → TV en directo" },
      { icon: Printer, title: "Impresión en sitio", what: "Cola de copias pagadas, búsqueda por código y vista de auto-impresión. Marca como impresa cuando se entrega.", where: "Panel → Impresión" },
      { icon: CreditCard, title: "Ingresos", what: "Ventas de descargas e impresiones: total, hoy, ticket medio, por tipo y pasarela, y pedidos recientes.", where: "Superadmin → Ingresos" },
    ],
  },
  {
    group: "Configuración",
    items: [
      { icon: CalendarDays, title: "Eventos y escenarios", what: "Crear/configurar eventos: marca de agua, modo de descarga (gratis/pago), patrocinadores, y alta de escenarios con su foto pública.", where: "Superadmin → Eventos" },
      { icon: Palette, title: "Marca y patrocinadores", what: "Logo oficial de la plataforma y listado de patrocinadores que aparecen en la web y la pantalla.", where: "Superadmin → Marca y logos" },
      { icon: Bot, title: "Moderación IA", what: "Activar la IA y configurar el proveedor y su clave (preparado para varios proveedores).", where: "Superadmin → Moderación IA" },
      { icon: LayoutTemplate, title: "Plantillas de venta", what: "Plantillas vertical/horizontal para las fotos tratadas: logo del sponsor, posición, marco.", where: "Superadmin → Plantillas" },
      { icon: CreditCard, title: "Pagos y precios", what: "Activar Stripe/PayPal, claves, moneda y precios de descarga e impresión.", where: "Superadmin → Pagos y precios" },
      { icon: Users, title: "Usuarios y roles", what: "Altas/bajas de superadmin, admin y moderadores.", where: "Superadmin → Usuarios" },
    ],
  },
  {
    group: "Legal y datos",
    items: [
      { icon: FileText, title: "Términos y privacidad", what: "Términos editables (versionados para prueba RGPD) y política de privacidad pública.", where: "Superadmin → Términos · Web → Legal" },
      { icon: ScrollText, title: "Auditoría", what: "Registro de todas las acciones relevantes del sistema (quién, qué y cuándo).", where: "Superadmin → Auditoría" },
      { icon: ShieldCheck, title: "Retiradas (RGPD)", what: "Solicitudes de retirada de fotos; al resolver, la foto se retira del almacenamiento y deja de ser pública.", where: "Superadmin → Retiradas" },
      { icon: Download, title: "Exportación", what: "Descarga de todas las fotos aprobadas + metadatos del evento en un ZIP.", where: "Superadmin → Exportación" },
    ],
  },
];

export default async function AyudaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("SUPERADMIN");

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    "Soporte · Calatafest Fotos",
  )}&body=${encodeURIComponent(
    "Hola, necesito ayuda con Calatafest Fotos.\n\nDescribe aquí tu consulta o problema:\n\n\n— Enviado desde el panel de soporte.",
  )}`;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 lg:px-8">
      <SuperHeader title="Ayuda y soporte" />

      {/* Bloque de soporte */}
      <div className="mb-7 flex flex-col gap-4 rounded-[16px] border border-brand/40 bg-brand/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <LifeBuoy className="mt-0.5 h-7 w-7 shrink-0 text-brand" />
          <div>
            <h2 className="font-display text-lg font-bold text-white">¿Necesitas ayuda?</h2>
            <p className="font-body text-sm text-mist">
              Escríbenos y te ayudamos. Soporte y desarrollo por <strong className="text-white">{DEVELOPER}</strong>.
            </p>
          </div>
        </div>
        <a href={mailto} className={buttonClass({ size: "sm", className: "uppercase" })}>
          <Mail className="h-4 w-4" /> Contactar con soporte
        </a>
      </div>

      <p className="mb-6 font-body text-mist">
        Resumen de todo lo que hace la plataforma y dónde se gestiona cada parte.
      </p>

      <div className="flex flex-col gap-7">
        {SECTIONS.map((sec) => (
          <section key={sec.group}>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand">{sec.group}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {sec.items.map((it) => {
                const Icon = it.icon;
                return (
                  <div key={it.title} className="rounded-[14px] border border-line bg-surface p-4">
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-5 w-5 text-brand" />
                      <h4 className="font-display text-[15px] font-bold text-white">{it.title}</h4>
                    </div>
                    <p className="mt-2 font-body text-[13.5px] leading-snug text-mist">{it.what}</p>
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-mist-2">{it.where}</p>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8 text-center font-body text-[12.5px] text-mist-2">
        Calatafest Fotos · Desarrollado por {DEVELOPER} · Soporte: {SUPPORT_EMAIL}
      </p>
    </main>
  );
}
