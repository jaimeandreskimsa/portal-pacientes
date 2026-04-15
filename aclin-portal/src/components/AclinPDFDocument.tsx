import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { PatientResults } from "@/services/irislab";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    padding: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#0d7749",
  },
  logo: {
    flexDirection: "column",
  },
  logoTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#0d7749",
  },
  logoSubtitle: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerLabel: {
    fontSize: 8,
    color: "#94a3b8",
    marginBottom: 2,
  },
  headerValue: {
    fontSize: 9,
    color: "#64748b",
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0d7749",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#f8fafb",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridItem: {
    width: "30%",
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 7,
    color: "#94a3b8",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  gridValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    padding: 8,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    padding: "6 8",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableCell: {
    fontSize: 8,
    color: "#374151",
  },
  col1: { width: "15%" },
  col2: { width: "55%" },
  col3: { width: "15%" },
  col4: { width: "15%" },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  badgeDisponible: {
    backgroundColor: "#dcfce7",
  },
  badgeEnProceso: {
    backgroundColor: "#fef3c7",
  },
  badgeTextDisponible: {
    fontSize: 7,
    color: "#166534",
    fontFamily: "Helvetica-Bold",
  },
  badgeTextEnProceso: {
    fontSize: 7,
    color: "#92400e",
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
  },
  pageNumber: {
    fontSize: 7,
    color: "#94a3b8",
  },
});

interface Props {
  results: PatientResults;
}

export function AclinPDFDocument({ results }: Props) {
  const { paciente, atencion, examenes } = results;

  return (
    <Document title={`Resultados ACLIN - ${atencion.numeroOrden}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoTitle}>ACLIN</Text>
            <Text style={styles.logoSubtitle}>Laboratorio Clínico</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>Fecha de emisión</Text>
            <Text style={styles.headerValue}>{new Date().toLocaleDateString("es-CL")}</Text>
            <Text style={[styles.headerLabel, { marginTop: 4 }]}>N° Folio</Text>
            <Text style={styles.headerValue}>{atencion.numeroOrden}</Text>
          </View>
        </View>

        {/* Patient Info */}
        <Text style={styles.sectionTitle}>Datos del Paciente</Text>
        <View style={styles.card}>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>RUT</Text>
              <Text style={styles.gridValue}>{paciente.rut}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Nombre</Text>
              <Text style={styles.gridValue}>{paciente.nombre}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Edad</Text>
              <Text style={styles.gridValue}>{paciente.edad} años</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Fecha de nacimiento</Text>
              <Text style={styles.gridValue}>{paciente.fechaNacimiento}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Sexo</Text>
              <Text style={styles.gridValue}>{paciente.sexo}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Fecha de atención</Text>
              <Text style={styles.gridValue}>{atencion.fechaAtencion}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Previsión</Text>
              <Text style={styles.gridValue}>{atencion.prevision}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Médico</Text>
              <Text style={styles.gridValue}>{atencion.medico}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Procedencia de muestra</Text>
              <Text style={styles.gridValue}>{atencion.tomaMuestras}</Text>
            </View>
          </View>
        </View>

        {/* Exams table */}
        <Text style={styles.sectionTitle}>Exámenes</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.col1]}>Código</Text>
          <Text style={[styles.tableHeaderCell, styles.col2]}>Descripción</Text>
          <Text style={[styles.tableHeaderCell, styles.col3]}>Tipo Pago</Text>
          <Text style={[styles.tableHeaderCell, styles.col4]}>Estado</Text>
        </View>

        {examenes.map((examen, i) => (
          <View
            key={i}
            style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafafa" }]}
          >
            <Text style={[styles.tableCell, styles.col1]}>{examen.codigo}</Text>
            <Text style={[styles.tableCell, styles.col2]}>{examen.descripcion}</Text>
            <Text style={[styles.tableCell, styles.col3]}>{examen.tipoPago}</Text>
            <View style={[styles.col4]}>
              <View style={[
                styles.badge,
                examen.estado === "Disponible" ? styles.badgeDisponible : styles.badgeEnProceso,
              ]}>
                <Text style={
                  examen.estado === "Disponible"
                    ? styles.badgeTextDisponible
                    : styles.badgeTextEnProceso
                }>
                  {examen.estado}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            ACLIN Laboratorio Clínico · 9 Norte 795, Viña del Mar · 323323600 · consultas@aclin.cl
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
