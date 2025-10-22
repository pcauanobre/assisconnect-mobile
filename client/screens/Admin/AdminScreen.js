import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image, FlatList, Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Appheader from "../../components/Appheader";

// Firebase
import {
  doc, setDoc, getDocs, getDoc, collection, serverTimestamp, writeBatch,
} from "firebase/firestore";
import { db, storage } from "../../services/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ---------- helpers ----------
const todayISO = () => new Date().toISOString().slice(0, 10);
const addDaysISO = (iso, n) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// Remove undefined
const sanitize = (v) => {
  if (Array.isArray(v)) return v.map(sanitize).filter((x) => x !== undefined);
  if (v && typeof v === "object") {
    const o = {};
    Object.keys(v).forEach((k) => {
      const sv = sanitize(v[k]);
      if (sv !== undefined) o[k] = sv;
    });
    return o;
  }
  return v === undefined ? undefined : v;
};

async function pickImage() {
  const { status } = await (await import("expo-image-picker")).requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permissão", "Precisamos de acesso à galeria para continuar.");
    return null;
  }
  const res = await (await import("expo-image-picker")).launchImageLibraryAsync({
    mediaTypes: (await import("expo-image-picker")).MediaTypeOptions.Images,
    quality: 0.85,
  });
  if (res.canceled) return null;
  return res.assets?.[0]?.uri || null;
}

async function uploadToStorage(localUri, pathInBucket) {
  if (!localUri) return null;
  const resp = await fetch(localUri);
  const blob = await resp.blob();
  const storageRef = ref(storage, pathInBucket);
  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
}

// ---------- random helpers ----------
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const nomesF = ["Juliana","Maria","Ana","Patrícia","Carla","Beatriz","Luciana","Fernanda","Marina","Carolina"];
const nomesM = ["Pedro","João","Carlos","Ricardo","Felipe","Bruno","Rodrigo","Marcos","Gustavo","Paulo"];
const sobres = ["Silva","Souza","Oliveira","Costa","Pereira","Rodrigues","Almeida","Gomes","Carvalho","Araujo"];
const cidades = [
  { cidade: "Fortaleza", estado: "CE" },
  { cidade: "Recife", estado: "PE" },
  { cidade: "Belém", estado: "PA" },
  { cidade: "São Paulo", estado: "SP" },
  { cidade: "Curitiba", estado: "PR" },
  { cidade: "Rio de Janeiro", estado: "RJ" },
];
const responsaveis = ["Pedro Nobre","Marina Alves","Fernanda Braga","João Paulo","Carolina Nunes"];

function randomNameByGender(genero) {
  const base = genero?.toLowerCase().startsWith("f") ? nomesF : nomesM;
  return `${pick(base)} ${pick(sobres)} ${pick(sobres)}`;
}
function randomCPF() { return String(randInt(10000000000, 99999999999)); }
function randomFotoUrl() { return `https://i.pravatar.cc/300?img=${randInt(1, 70)}`; }
function randomRespSexo() { return pick(["Feminino", "Masculino", "Outro"]); }
function randomGeneroIdoso() { return pick(["Feminino", "Masculino"]); }
function randomRua() { return `Rua ${pick(["das Flores","dos Ipês","da Praia","do Sol","das Palmeiras"])} ${randInt(10, 999)}`; }
function randomConds() {
  const all = ["Hipertensão","Diabetes","Artrose","Osteoporose","Asma"];
  const n = randInt(1, 3);
  const s = new Set();
  while (s.size < n) s.add(pick(all));
  return Array.from(s).join(",");
}
function randomMeds() {
  const meds = [
    { nome: "Losartana", dose: "50mg" },
    { nome: "Metformina", dose: "500mg" },
    { nome: "Atenolol", dose: "25mg" },
    { nome: "Sinvastatina", dose: "10mg" },
    { nome: "Vitamina D", dose: "-" },
  ];
  const itens = randInt(2, 3);
  return Array(itens).fill(0).map(() => {
    const m = pick(meds);
    const h = `${String(randInt(7, 20)).padStart(2, "0")}:${pick(["00","15","30","45"])}`;
    return `${m.nome} ${m.dose} - ${h}`;
  }).join("; ");
}

const randomDiaPayload = (dateISO) => {
  const medsArr = (randomMeds() || "")
    .split(";").map((s) => s.trim()).filter(Boolean)
    .map((linha) => {
      const [esq, horario] = linha.split("-").map((t) => t.trim());
      const partes = (esq || "").split(" ");
      const dose = partes.length > 1 ? partes[partes.length - 1] : "-";
      const nome = partes.length > 1 ? partes.slice(0, -1).join(" ") : (esq || "-");
      return { nome, dose, horario: horario || "" };
    });

  return sanitize({
    dataISO: dateISO,
    presenca: pick(["Confirmada","Ausente","Em atraso"]),
    responsavelDoDia: pick(responsaveis),
    humorNivel: randInt(1, 5),
    ultimaSync: serverTimestamp(),
    medicamentosDia: medsArr,
    alimentacao: pick([
      "Almoçou bem, comeu toda a refeição.",
      "Alimentou-se pouco, preferiu frutas.",
      "Recusou o jantar, bebeu suco.",
    ]),
    comentarios: pick([
      "Participou da oficina de pintura.",
      "Conversou com a psicóloga.",
      "Fez caminhada leve no jardim.",
      "Jogou dominó com colegas.",
    ]),
  });
};

const NEW_FORM = () => ({
  // Identificação (idoso)
  cpf: "",
  nome: "",
  genero: "",
  dataNascimento: "",
  // Saúde
  altura_cm: "",
  peso_kg: "",
  condicoes: "",
  // Endereço & contato do idoso
  cep: "",
  cidade: "",
  estado: "",
  rua: "",
  telefoneIdoso: "85998175354",
  // Fotos
  fotoPerfilUrl: "",
  // Responsável
  responsavelNome: "",
  responsavelEmail: "pedrocauaggn@gmail.com",
  responsavelTelefone: "85998175354",
  responsavelParentesco: "",
  responsavelNascimento: "",
  responsavelSexo: "",
  responsavelFotoUrl: "",
  // Documentos
  rgUrl: "",
  vacinaUrl: "",
  susUrl: "",
  // Rotina diária (avulsa – compatibilidade)
  dataDiaISO: todayISO(),
  presenca: "Confirmada",
  responsavelDoDia: "",
  humorNivel: "3",
  medicamentosTexto: "",
  alimentacao: "",
  comentarios: "",
});

const BROWN = "#3A1F0F";

export default function AdminScreen() {
  const [mode, setMode] = useState("list"); // 'list' | 'edit'

  // ==== Lista/search ====
  const [profiles, setProfiles] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [q, setQ] = useState("");

  // preview cards otimistas
  const [optimisticCards, setOptimisticCards] = useState({});

  // ==== Form/edição ====
  const [form, setForm] = useState(NEW_FORM());
  const [selectedCpf, setSelectedCpf] = useState(null);

  // imagens locais
  const [fotoPerfilLocal, setFotoPerfilLocal] = useState(null);
  const [respFotoLocal, setRespFotoLocal] = useState(null);
  const [rgLocal, setRgLocal] = useState(null);
  const [vacinaLocal, setVacinaLocal] = useState(null);
  const [susLocal, setSusLocal] = useState(null);

  // ===== Rotina (multi-dias) =====
  const [routineOpen, setRoutineOpen] = useState(false);
  const [routineDays, setRoutineDays] = useState([]); // [{dataISO, ..., expanded}]
  const lastRoutineRef = useRef(null); // guarda último ISO adicionado

  const update = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (["nome", "fotoPerfilUrl", "responsavelFotoUrl"].includes(k)) {
      const key = (k === "nome" || k === "fotoPerfilUrl") ? (form.cpf?.trim() || "__draft__") : null;
      if (key) {
        setOptimisticCards((prev) => {
          const base = prev[key] || {};
          if (k === "nome") return { ...prev, [key]: { ...base, nome: v } };
          if (k === "fotoPerfilUrl") return { ...prev, [key]: { ...base, fotoUrl: v || "" } };
          return prev;
        });
      }
    }
  };

  // mover draft → cpf quando cpf muda
  const prevCpfRef = useRef("");
  useEffect(() => {
    const cpfNow = (form.cpf || "").trim();
    const prevCpf = prevCpfRef.current;
    if (cpfNow !== prevCpf) {
      prevCpfRef.current = cpfNow;
      setOptimisticCards((prev) => {
        if (!prev["__draft__"]) return prev;
        const moved = { ...prev };
        if (cpfNow) moved[cpfNow] = { ...(moved["__draft__"] || {}) };
        delete moved["__draft__"];
        return moved;
      });
    }
  }, [form.cpf]);

  // lista
  const loadProfiles = useCallback(async () => {
    try {
      setLoadingList(true);
      const snap = await getDocs(collection(db, "pessoaIdosa"));
      const arr = snap.docs.map((d) => {
        const data = d.data() || {};
        return { cpf: d.id, nome: data?.nome || "—", fotoUrl: data?.fotoUrl || null };
      });
      arr.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
      setProfiles(arr);
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Falha ao carregar perfis.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  const mergedProfiles = useMemo(() => {
    const map = new Map(profiles.map((p) => [p.cpf, { ...p }]));
    Object.entries(optimisticCards).forEach(([k, v]) => {
      if (k === "__draft__") return;
      const base = map.get(k) || { cpf: k, nome: "—", fotoUrl: null };
      map.set(k, { ...base, ...v, fotoUrl: v?.fotoUrl ?? base.fotoUrl });
    });
    const merged = Array.from(map.values());
    if (optimisticCards["__draft__"]) {
      merged.unshift({
        cpf: "__draft__",
        nome: optimisticCards["__draft__"].nome || "Rascunho",
        fotoUrl: optimisticCards["__draft__"].fotoUrl || null,
      });
    }
    const t = q.trim().toLowerCase();
    if (!t) return merged;
    return merged.filter(p =>
      (p.nome || "").toLowerCase().includes(t) || (p.cpf || "").toLowerCase().includes(t)
    );
  }, [profiles, optimisticCards, q]);

  // abrir novo/editar
  const handleOpenNew = () => {
    setSelectedCpf(null);
    setForm(NEW_FORM());
    setFotoPerfilLocal(null); setRespFotoLocal(null);
    setRgLocal(null); setVacinaLocal(null); setSusLocal(null);
    setOptimisticCards((prev) => ({ ...prev, "__draft__": {} }));
    lastRoutineRef.current = null;
    setRoutineDays([]); // começa vazio
    setMode("edit");
  };

  const handleOpenEdit = useCallback(async (cpf) => {
    try {
      setSelectedCpf(cpf);
      const pessoaRef = doc(db, "pessoaIdosa", String(cpf));
      const pessoaSnap = await getDoc(pessoaRef);
      if (!pessoaSnap.exists()) {
        Alert.alert("Atenção", "Cadastro não encontrado.");
        return;
      }
      const p = pessoaSnap.data() || {};
      setForm({
        cpf: cpf,
        nome: p?.nome || "",
        genero: p?.genero || "",
        dataNascimento: p?.dataNascimento || "",
        altura_cm: String(p?.altura_cm ?? ""),
        peso_kg: String(p?.peso_kg ?? ""),
        condicoes: (p?.condicoes || []).join(","),
        cep: p?.endereco?.cep || "",
        cidade: p?.endereco?.cidade || "",
        estado: p?.endereco?.estado || "",
        rua: p?.endereco?.rua || "",
        telefoneIdoso: p?.contato?.telefone || "85998175354",
        fotoPerfilUrl: p?.fotoUrl || "",
        responsavelNome: p?.responsavel?.nome || "",
        responsavelEmail: "pedrocauaggn@gmail.com",
        responsavelTelefone: "85998175354",
        responsavelParentesco: p?.responsavel?.parentesco || "",
        responsavelNascimento: p?.responsavel?.dataNascimento || "",
        responsavelSexo: p?.responsavel?.sexo || "",
        responsavelFotoUrl: p?.responsavel?.fotoUrl || "",
        rgUrl: p?.documentos?.rgUrl || "",
        vacinaUrl: p?.documentos?.vacinaUrl || "",
        susUrl: p?.documentos?.susUrl || "",
        dataDiaISO: todayISO(),
        presenca: "Confirmada",
        responsavelDoDia: "",
        humorNivel: "3",
        medicamentosTexto: "",
        alimentacao: "",
        comentarios: "",
      });

      setFotoPerfilLocal(null); setRespFotoLocal(null);
      setRgLocal(null); setVacinaLocal(null); setSusLocal(null);

      setOptimisticCards((prev) => ({
        ...prev,
        [cpf]: { nome: p?.nome || "", fotoUrl: p?.fotoUrl || "" },
      }));

      lastRoutineRef.current = null;
      setRoutineDays([]); // começa vazio (você adiciona no modal)
      setMode("edit");
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Falha ao abrir o perfil.");
    }
  }, []);

  // excluir (sem confirmação; volta para a lista)
  const deleteByCpf = async (cpf) => {
    try {
      const batch = writeBatch(db);
      const diasSnap = await getDocs(collection(db, `pessoaIdosa/${cpf}/dias`));
      diasSnap.forEach((sd) => batch.delete(doc(db, `pessoaIdosa/${cpf}/dias/${sd.id}`)));
      batch.delete(doc(db, "pessoaIdosa", cpf));
      await batch.commit();
      setOptimisticCards((prev) => { const c = { ...prev }; delete c[cpf]; return c; });
      await loadProfiles();
      setMode("list"); // volta pra tela inicial do admin
      Alert.alert("Excluído", `Perfil ${cpf} removido.`);
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível excluir o perfil.");
    }
  };

  // randomizar tudo do formulário
  const randomizarTudo = () => {
    const genero = randomGeneroIdoso();
    const { cidade, estado } = pick(cidades);
    const cpf = form.cpf?.trim() || randomCPF();
    const respSexo = randomRespSexo();

    const novo = {
      ...form,
      cpf,
      nome: randomNameByGender(genero),
      genero,
      dataNascimento: "01/01/1950",
      altura_cm: String(randInt(150, 175)),
      peso_kg: String(randInt(55, 85)),
      condicoes: randomConds(),
      cep: "60000-000",
      cidade,
      estado,
      rua: randomRua(),
      telefoneIdoso: "85998175354",
      fotoPerfilUrl: randomFotoUrl(),
      responsavelNome: randomNameByGender(respSexo),
      responsavelEmail: "pedrocauaggn@gmail.com",
      responsavelTelefone: "85998175354",
      responsavelParentesco: pick(["Filho","Filha","Sobrinho(a)","Neto(a)"]),
      responsavelNascimento: "15/08/1990",
      responsavelSexo: respSexo,
      responsavelFotoUrl: randomFotoUrl(),
      dataDiaISO: todayISO(),
      presenca: pick(["Confirmada","Ausente","Em atraso"]),
      responsavelDoDia: pick(responsaveis),
      humorNivel: String(randInt(1, 5)),
      medicamentosTexto: randomMeds(),
      alimentacao: pick([
        "Almoçou bem, comeu toda a refeição.",
        "Alimentou-se pouco, preferiu frutas.",
        "Recusou o jantar, bebeu suco.",
      ]),
      comentarios: pick([
        "Participou da oficina de pintura.",
        "Conversou com a psicóloga.",
        "Fez caminhada leve no jardim.",
        "Jogou dominó com colegas.",
      ]),
    };
    setForm(novo);

    setFotoPerfilLocal(null);
    setRespFotoLocal(null);
    setRgLocal(null);
    setVacinaLocal(null);
    setSusLocal(null);

    const key = cpf || "__draft__";
    setOptimisticCards((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), nome: novo.nome, fotoUrl: novo.fotoPerfilUrl },
    }));
  };

  // ===== Rotina (modal) =====
  const toggleExpand = (index) => {
    setRoutineDays((prev) => {
      const arr = [...prev];
      arr[index] = { ...arr[index], expanded: !arr[index].expanded };
      return arr;
    });
  };

  const addRoutineDay = () => {
    const base = lastRoutineRef.current || todayISO();
    const nextISO = lastRoutineRef.current ? addDaysISO(base, 1) : addDaysISO(base, 1); // sempre após hoje
    const payload = randomDiaPayload(nextISO);
    const item = {
      dataISO: nextISO,
      presenca: payload.presenca,
      responsavelDoDia: payload.responsavelDoDia,
      humorNivel: payload.humorNivel,
      medicamentosDia: payload.medicamentosDia,
      alimentacao: payload.alimentacao,
      comentarios: payload.comentarios,
      expanded: false, // começa recolhido
    };
    lastRoutineRef.current = nextISO;
    setRoutineDays((prev) => [...prev, item]);
  };

  const updateRoutineField = (index, key, value) => {
    setRoutineDays((prev) => {
      const arr = [...prev];
      arr[index] = { ...arr[index], [key]: value };
      return arr;
    });
  };

  const removeRoutineDay = (index) => {
    setRoutineDays((prev) => prev.filter((_, i) => i !== index));
    // reajuste do lastRoutineRef
    setTimeout(() => {
      setRoutineDays((arr) => {
        lastRoutineRef.current = arr.length ? arr[arr.length - 1].dataISO : null;
        return arr;
      });
    }, 0);
  };

  // salvar perfil (merge) + salvar dias do modal
  const salvarAtual = async () => {
    try {
      const cpf = (form.cpf || "").trim();
      if (!cpf) return Alert.alert("Atenção", "Informe o CPF (ID do documento).");

      // fotos
      const fotoUrl = fotoPerfilLocal
        ? await uploadToStorage(fotoPerfilLocal, `pessoaIdosa/${cpf}/perfil.jpg`)
        : (form.fotoPerfilUrl?.trim() || "");

      const respFotoUrl = respFotoLocal
        ? await uploadToStorage(respFotoLocal, `pessoaIdosa/${cpf}/responsavel/perfil.jpg`)
        : (form.responsavelFotoUrl?.trim() || "");

      // docs
      const rgUrl = rgLocal
        ? await uploadToStorage(rgLocal, `pessoaIdosa/${cpf}/docs/rg.jpg`)
        : (form.rgUrl?.trim() || "");
      const vacinaUrl = vacinaLocal
        ? await uploadToStorage(vacinaLocal, `pessoaIdosa/${cpf}/docs/vacina.jpg`)
        : (form.vacinaUrl?.trim() || "");
      const susUrl = susLocal
        ? await uploadToStorage(susLocal, `pessoaIdosa/${cpf}/docs/sus.jpg`)
        : (form.susUrl?.trim() || "");

      const pessoaPayload = sanitize({
        nome: (form.nome || "").trim(),
        genero: (form.genero || "").trim(),
        dataNascimento: (form.dataNascimento || "").trim(),
        altura_cm: Number(form.altura_cm || 0),
        peso_kg: Number(form.peso_kg || 0),
        condicoes: (form.condicoes || "").split(",").map((s) => s.trim()).filter(Boolean),
        endereco: {
          cep: (form.cep || "").trim(),
          cidade: (form.cidade || "").trim(),
          estado: (form.estado || "").trim(),
          rua: (form.rua || "").trim(),
        },
        contato: { telefone: (form.telefoneIdoso || "").trim() },
        responsavel: {
          nome: (form.responsavelNome || "").trim(),
          sexo: (form.responsavelSexo || "").trim(),
          email: "pedrocauaggn@gmail.com",
          telefone: "85998175354",
          parentesco: (form.responsavelParentesco || "").trim(),
          dataNascimento: (form.responsavelNascimento || "").trim(),
          ...(respFotoUrl ? { fotoUrl: respFotoUrl } : {}),
        },
        ...(fotoUrl ? { fotoUrl } : {}),
        documentos: {
          rgUrl: rgUrl || null,
          vacinaUrl: vacinaUrl || null,
          susUrl: susUrl || null,
        },
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      // rotina do dia avulso (compatibilidade)
      let nivel = Number(form.humorNivel);
      if (!Number.isFinite(nivel)) nivel = 3;
      nivel = Math.min(5, Math.max(1, Math.round(nivel)));

      const medsArr = (form.medicamentosTexto || "")
        .split(";").map((s) => s.trim()).filter(Boolean)
        .map((linha) => {
          const [esq, horario] = linha.split("-").map((t) => t.trim());
          const partes = (esq || "").split(" ");
          const dose = partes.length > 1 ? partes[partes.length - 1] : "-";
          const nome = partes.length > 1 ? partes.slice(0, -1).join(" ") : (esq || "-");
          return { nome, dose, horario: horario || "" };
        });

      const diaPayload = sanitize({
        dataISO: (form.dataDiaISO || "").trim(),
        presenca: (form.presenca || "").trim(),
        responsavelDoDia: (form.responsavelDoDia || "").trim(),
        humorNivel: nivel,
        ultimaSync: serverTimestamp(),
        medicamentosDia: medsArr,
        alimentacao: (form.alimentacao || "").trim(),
        comentarios: (form.comentarios || "").trim(),
      });

      // grava perfil
      await setDoc(doc(db, "pessoaIdosa", cpf), pessoaPayload, { merge: true });

      // grava rotina do dia avulso (se preenchida)
      if (form.dataDiaISO) {
        await setDoc(doc(db, `pessoaIdosa/${cpf}/dias/${(form.dataDiaISO || "").trim()}`), diaPayload, { merge: true });
      }

      // grava dias do modal (se houver)
      if (routineDays.length) {
        const batch = writeBatch(db);
        routineDays.forEach((d) => {
          const refDay = doc(db, `pessoaIdosa/${cpf}/dias/${d.dataISO}`);
          const payload = sanitize({
            dataISO: d.dataISO,
            presenca: (d.presenca || "").trim(),
            responsavelDoDia: (d.responsavelDoDia || "").trim(),
            humorNivel: Math.min(5, Math.max(1, Number(d.humorNivel || 3))),
            ultimaSync: serverTimestamp(),
            medicamentosDia: (d.medicamentosDia || []).map((m) => ({
              nome: (m?.nome || "").trim(),
              dose: (m?.dose || "").trim(),
              horario: (m?.horario || "").trim(),
            })),
            alimentacao: (d.alimentacao || "").trim(),
            comentarios: (d.comentarios || "").trim(),
          });
          batch.set(refDay, payload, { merge: true });
        });
        await batch.commit();
      }

      setOptimisticCards((prev) => ({
        ...prev,
        [cpf]: { ...(prev[cpf] || {}), nome: form.nome || "", fotoUrl: fotoUrl || (prev[cpf]?.fotoUrl || "") },
      }));
      setOptimisticCards((prev) => { const c = { ...prev }; delete c["__draft__"]; return c; });

      await loadProfiles();
      Alert.alert("✅ Sucesso", "Perfil e rotina salvos.");
      setMode("list");
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", String(e?.message || e));
    }
  };

  // previews locais (prioridade local > url)
  const idosoPreviewUri = fotoPerfilLocal || (form.fotoPerfilUrl?.trim() || "");
  const respPreviewUri = respFotoLocal || (form.responsavelFotoUrl?.trim() || "");
  const rgPreviewUri = rgLocal || (form.rgUrl?.trim() || "");
  const vacinaPreviewUri = vacinaLocal || (form.vacinaUrl?.trim() || "");
  const susPreviewUri = susLocal || (form.susUrl?.trim() || "");

  useEffect(() => {
    if (!fotoPerfilLocal && !form.fotoPerfilUrl) return;
    const key = (form.cpf || "").trim() || "__draft__";
    const fotoUrl = fotoPerfilLocal || form.fotoPerfilUrl || "";
    setOptimisticCards((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), fotoUrl } }));
  }, [fotoPerfilLocal, form.fotoPerfilUrl, form.cpf]);

  // ====== RENDER ======
  if (mode === "list") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <Appheader styles={appHeaderStyles} />
        <View style={styles.listContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Perfis</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity style={styles.refreshBtn} onPress={loadProfiles}>
                <Feather name="refresh-cw" size={16} color="#fff" />
                <Text style={styles.refreshText}>{loadingList ? "Atualizando..." : "Atualizar"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.refreshBtn, { backgroundColor: BROWN }]} onPress={handleOpenNew}>
                <Feather name="plus" size={16} color="#fff" />
                <Text style={styles.refreshText}>Novo</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchRow}>
            <Feather name="search" size={18} color="#8A7B6A" />
            <TextInput
              placeholder="Buscar por nome ou CPF"
              placeholderTextColor="#B29F8D"
              style={styles.searchInput}
              value={q}
              onChangeText={setQ}
              autoCapitalize="none"
            />
            {q ? (
              <TouchableOpacity onPress={() => setQ("")}>
                <Feather name="x" size={18} color="#8A7B6A" />
              </TouchableOpacity>
            ) : null}
          </View>

          <FlatList
            data={mergedProfiles}
            keyExtractor={(item) => item.cpf}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ paddingBottom: 20, paddingTop: 6 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => {
              const isDraft = item.cpf === "__draft__";
              return (
                <TouchableOpacity
                  style={card.card}
                  onPress={() => (isDraft ? handleOpenNew() : handleOpenEdit(item.cpf))}
                  onLongPress={() => {
                    if (isDraft) {
                      setOptimisticCards((prev) => { const c = { ...prev }; delete c["__draft__"]; return c; });
                    } else {
                      Alert.alert("Excluir perfil", `Remover ${item.nome} (${item.cpf})?`, [
                        { text: "Cancelar", style: "cancel" },
                        { text: "Excluir", style: "destructive", onPress: () => deleteByCpf(item.cpf) },
                      ]);
                    }
                  }}
                >
                  <View style={card.avatarWrap}>
                    {item.fotoUrl ? (
                      <Image source={{ uri: item.fotoUrl }} style={card.avatar} />
                    ) : (
                      <View style={[card.avatar, { backgroundColor: "#EEE" }]} />
                    )}
                  </View>
                  <Text numberOfLines={1} style={card.name}>{item.nome || (isDraft ? "Rascunho" : "—")}</Text>
                  <Text numberOfLines={1} style={card.cpf}>{isDraft ? "—" : item.cpf}</Text>
                  <View style={[card.actions]}>
                    <Feather name="edit-2" size={14} color={BROWN} />
                    <Text style={[card.actionsText]}>Editar</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ====== EDIT VIEW ======
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <Appheader styles={appHeaderStyles} />
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={() => setMode("list")}>
          <Feather name="arrow-left" size={18} color="#3B2C1A" />
          <Text style={styles.topBtnText}>Voltar</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity style={[styles.topBtn, { backgroundColor: "#2E7D32" }]} onPress={salvarAtual}>
            <Feather name="save" size={16} color="#fff" />
            <Text style={[styles.topBtnText, { color: "#fff" }]}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{selectedCpf ? "Editar Perfil" : "Novo Perfil"}</Text>

        {/* Foto idoso */}
        <Text style={styles.section}>Foto do Idoso</Text>
        <CenteredPickPreview
          title="Pré-visualização"
          uri={idosoPreviewUri}
          onPick={async () => {
            const uri = await pickImage();
            if (!uri) return;
            setFotoPerfilLocal(uri);
          }}
        />
        <Text style={styles.label}>URL da Foto (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          value={form.fotoPerfilUrl}
          onChangeText={(t) => { setFotoPerfilLocal(null); update("fotoPerfilUrl", t); }}
          autoCapitalize="none"
        />

        {/* Foto responsável */}
        <Text style={styles.section}>Foto do Responsável</Text>
        <CenteredPickPreview
          title="Pré-visualização"
          uri={respPreviewUri}
          onPick={async () => {
            const uri = await pickImage();
            if (!uri) return;
            setRespFotoLocal(uri);
          }}
        />
        <Text style={styles.label}>URL da Foto (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          value={form.responsavelFotoUrl}
          onChangeText={(t) => { setRespFotoLocal(null); update("responsavelFotoUrl", t); }}
          autoCapitalize="none"
        />

        {/* Docs */}
        <Text style={styles.section}>Documentos (imagens)</Text>
        <Text style={[styles.label, { marginTop: 4 }]}>RG</Text>
        <RowPickPreview uri={rgPreviewUri} onPick={async () => setRgLocal(await pickImage())} />
        <TextInput style={styles.input} placeholder="URL do RG (opcional)" value={form.rgUrl} onChangeText={(t)=>{ setRgLocal(null); update("rgUrl", t); }} autoCapitalize="none" />
        <Text style={styles.label}>Carteira de Vacinação</Text>
        <RowPickPreview uri={vacinaPreviewUri} onPick={async () => setVacinaLocal(await pickImage())} />
        <TextInput style={styles.input} placeholder="URL da vacina (opcional)" value={form.vacinaUrl} onChangeText={(t)=>{ setVacinaLocal(null); update("vacinaUrl", t); }} autoCapitalize="none" />
        <Text style={styles.label}>Cartão do SUS</Text>
        <RowPickPreview uri={susPreviewUri} onPick={async () => setSusLocal(await pickImage())} />
        <TextInput style={styles.input} placeholder="URL do SUS (opcional)" value={form.susUrl} onChangeText={(t)=>{ setSusLocal(null); update("susUrl", t); }} autoCapitalize="none" />

        {/* Dados do idoso */}
        <Text style={styles.section}>Dados do Idoso</Text>
        {[
          { label: "CPF (ID do documento)", key: "cpf", kb: "number-pad" },
          { label: "Nome do Idoso", key: "nome" },
          { label: "Gênero", key: "genero" },
          { label: "Data de Nascimento (Idoso)", key: "dataNascimento" },
          { label: "Altura (cm)", key: "altura_cm", kb: "number-pad" },
          { label: "Peso (kg)", key: "peso_kg", kb: "number-pad" },
          { label: "Condições (vírgula)", key: "condicoes" },
          { label: "CEP", key: "cep" },
          { label: "Cidade", key: "cidade" },
          { label: "Estado", key: "estado" },
          { label: "Rua e número", key: "rua" },
          { label: "Telefone do Idoso", key: "telefoneIdoso", kb: "phone-pad" },
        ].map((i) => (
          <View key={i.key} style={{ marginBottom: 10 }}>
            <Text style={styles.label}>{i.label}</Text>
            <TextInput style={styles.input} value={String(form[i.key] ?? "")} onChangeText={(t)=>update(i.key, t)} keyboardType={i.kb || "default"} />
          </View>
        ))}

        {/* Dados do responsável */}
        <Text style={styles.section}>Dados do Responsável</Text>
        {[
          { label: "Responsável - Nome", key: "responsavelNome" },
          { label: "Responsável - Sexo", key: "responsavelSexo" },
          { label: "Responsável - E-mail (fixo)", key: "responsavelEmail" },
          { label: "Responsável - Telefone (fixo)", key: "responsavelTelefone", kb: "phone-pad" },
          { label: "Responsável - Parentesco", key: "responsavelParentesco" },
          { label: "Responsável - Nascimento", key: "responsavelNascimento" },
        ].map((i) => (
          <View key={i.key} style={{ marginBottom: 10 }}>
            <Text style={styles.label}>{i.label}</Text>
            <TextInput
              style={styles.input}
              value={String(form[i.key] ?? "")}
              onChangeText={(t)=>update(i.key, t)}
              keyboardType={i.kb || "default"}
              autoCapitalize={i.key.includes("Email") ? "none" : "sentences"}
              editable={i.key === "responsavelEmail" || i.key === "responsavelTelefone" ? false : true}
            />
          </View>
        ))}

        {/* Rotina do Dia (avulsa) */}
        <Text style={styles.section}>Rotina do Dia</Text>
        {[
          { label: "Data do Dia (AAAA-MM-DD)", key: "dataDiaISO" },
          { label: "Presença", key: "presenca" },
          { label: "Responsável do Dia", key: "responsavelDoDia" },
          { label: "Humor do Dia (nível 1–5)", key: "humorNivel", kb: "number-pad" },
          { label: "Medicamentos do Dia (; entre itens)", key: "medicamentosTexto" },
          { label: "Alimentação do Dia", key: "alimentacao" },
          { label: "Comentários do Dia", key: "comentarios" },
        ].map((i) => (
          <View key={i.key} style={{ marginBottom: 10 }}>
            <Text style={styles.label}>{i.label}</Text>
            <TextInput style={styles.input} value={String(form[i.key] ?? "")} onChangeText={(t)=>update(i.key, t)} keyboardType={i.kb || "default"} />
          </View>
        ))}

        {/* ===== Botão "Editar rotina" ===== */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: BROWN, marginTop: 6 }]}
          onPress={() => setRoutineOpen(true)}
        >
          <Feather name="calendar" size={16} color="#fff" />
          <Text style={[styles.btnText, { marginLeft: 8 }]}>Editar rotina (multi-dias)</Text>
        </TouchableOpacity>

        {/* Ações */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#C62828", marginTop: 12 }]}
          onPress={async () => {
            const cpf = (form.cpf || "").trim();
            if (!cpf) return Alert.alert("Atenção", "Informe um CPF para excluir.");
            await deleteByCpf(cpf); // direto, sem confirmação
          }}
        >
          <Text style={styles.btnText}>Excluir perfil</Text>
        </TouchableOpacity>

        {/* Randomizar */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: BROWN, marginTop: 10 }]}
          onPress={randomizarTudo}
        >
          <Feather name="shuffle" size={16} color="#fff" />
          <Text style={[styles.btnText, { marginLeft: 8 }]}>Randomizar</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ===== Modal de Rotina (multi-dias) ===== */}
      <Modal
        visible={routineOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRoutineOpen(false)}
      >
        <View style={modal.overlay}>
          <View style={modal.card}>
            <Text style={modal.title}>Editar rotina</Text>
            <Text style={modal.subtitle}>
              Adicione dias após hoje. Toque no nome do dia para expandir/recolher.
            </Text>

            {/* Lista de dias (accordion por dia) */}
            <ScrollView style={{ maxHeight: 420 }}>
              {routineDays.length === 0 ? (
                <View style={modal.emptyBox}>
                  <Feather name="calendar" size={18} color={BROWN} />
                  <Text style={modal.emptyText}>Nenhum dia adicionado ainda.</Text>
                </View>
              ) : (
                routineDays.map((d, idx) => (
                  <View key={d.dataISO} style={modal.dayCard}>
                    {/* Header do dia: título + ações, clique para expandir */}
                    <TouchableOpacity style={modal.dayHeader} onPress={() => toggleExpand(idx)} activeOpacity={0.7}>
                      <Text style={modal.dayTitle}>{d.dataISO}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <Feather
                          name={d.expanded ? "chevron-up" : "chevron-down"}
                          size={18}
                          color={BROWN}
                        />
                        <TouchableOpacity onPress={() => removeRoutineDay(idx)}>
                          <Feather name="trash-2" size={16} color="#8B2E2E" />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>

                    {/* Corpo expandível */}
                    {d.expanded && (
                      <>
                        <Field label="Presença" value={d.presenca} onChange={(v)=>updateRoutineField(idx, "presenca", v)} />
                        <Field label="Responsável do Dia" value={d.responsavelDoDia} onChange={(v)=>updateRoutineField(idx, "responsavelDoDia", v)} />
                        <Field label="Humor (1–5)" value={String(d.humorNivel ?? "")} onChange={(v)=>updateRoutineField(idx, "humorNivel", v)} keyboardType="number-pad" />
                        <Field label="Alimentação" value={d.alimentacao} onChange={(v)=>updateRoutineField(idx, "alimentacao", v)} />
                        <Field label="Comentários" value={d.comentarios} onChange={(v)=>updateRoutineField(idx, "comentarios", v)} />

                        {/* Medicamentos */}
                        <Text style={modal.medsLabel}>Medicamentos</Text>
                        {(d.medicamentosDia || []).map((m, mi) => (
                          <View key={`${d.dataISO}-${mi}`} style={modal.medsRow}>
                            <TextInput
                              style={[styles.input, { flex: 1 }]}
                              placeholder="Nome"
                              value={m.nome}
                              onChangeText={(v)=>{
                                const meds = [...(d.medicamentosDia || [])];
                                meds[mi] = { ...meds[mi], nome: v };
                                updateRoutineField(idx, "medicamentosDia", meds);
                              }}
                            />
                            <TextInput
                              style={[styles.input, { width: 80 }]}
                              placeholder="Dose"
                              value={m.dose}
                              onChangeText={(v)=>{
                                const meds = [...(d.medicamentosDia || [])];
                                meds[mi] = { ...meds[mi], dose: v };
                                updateRoutineField(idx, "medicamentosDia", meds);
                              }}
                            />
                            <TextInput
                              style={[styles.input, { width: 90 }]}
                              placeholder="HH:MM"
                              value={m.horario}
                              onChangeText={(v)=>{
                                const meds = [...(d.medicamentosDia || [])];
                                meds[mi] = { ...meds[mi], horario: v };
                                updateRoutineField(idx, "medicamentosDia", meds);
                              }}
                            />
                            <TouchableOpacity
                              style={modal.iconBtn}
                              onPress={()=>{
                                const meds = (d.medicamentosDia || []).filter((_, k) => k !== mi);
                                updateRoutineField(idx, "medicamentosDia", meds);
                              }}
                            >
                              <Feather name="minus-circle" size={18} color="#8B2E2E" />
                            </TouchableOpacity>
                          </View>
                        ))}
                        <TouchableOpacity
                          style={[styles.btn, { backgroundColor: "#6D4C41", marginTop: 6 }]}
                          onPress={()=>{
                            const meds = [...(d.medicamentosDia || [])];
                            meds.push({ nome: "Paracetamol", dose: "500mg", horario: "08:00" });
                            updateRoutineField(idx, "medicamentosDia", meds);
                          }}
                        >
                          <Feather name="plus" size={16} color="#fff" />
                          <Text style={[styles.btnText, { marginLeft: 6 }]}>Adicionar medicamento</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                ))
              )}
            </ScrollView>

            <View style={modal.actions}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: BROWN, flex: 1 }]} onPress={addRoutineDay}>
                <Feather name="plus" size={16} color="#fff" />
                <Text style={[styles.btnText, { marginLeft: 8 }]}>Adicionar dia</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: "#444", flex: 1 }]} onPress={() => setRoutineOpen(false)}>
                <Text style={styles.btnText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ===== UI helpers =====
function RowPickPreview({ uri, onPick }) {
  return (
    <View style={rowStyles.wrap}>
      {uri ? <Image source={{ uri }} style={rowStyles.preview} /> : <View style={[rowStyles.preview, { backgroundColor: "#eee" }]} />}
      <TouchableOpacity style={[styles.btn, { backgroundColor: BROWN, paddingHorizontal: 14 }]} onPress={onPick}>
        <Text style={styles.btnText}>Escolher Imagem</Text>
      </TouchableOpacity>
    </View>
  );
}

function CenteredPickPreview({ title, uri, onPick }) {
  return (
    <View style={centerPick.wrap}>
      <Text style={centerPick.title}>{title}</Text>
      {uri ? <Image source={{ uri }} style={centerPick.preview} /> : <View style={[centerPick.preview, { backgroundColor: "#eee" }]} />}
      <TouchableOpacity style={[styles.btn, { backgroundColor: BROWN, paddingHorizontal: 18, marginTop: 8 }]} onPress={onPick}>
        <Text style={styles.btnText}>Escolher Imagem</Text>
      </TouchableOpacity>
    </View>
  );
}

function Field({ label, value, onChange, keyboardType = "default" }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ color: "#4B2E0F", fontWeight: "600", marginBottom: 4 }}>{label}</Text>
      <TextInput
        style={[styles.input, { fontSize: 13 }]}
        value={String(value ?? "")}
        onChangeText={onChange}
        keyboardType={keyboardType}
      />
    </View>
  );
}

// ---------- estilos ----------
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF6ED" },

  // LIST
  listContainer: { flex: 1, paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#3B2C1A" },
  refreshBtn: { flexDirection: "row", gap: 6, alignItems: "center", backgroundColor: BROWN, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  refreshText: { color: "#fff", fontWeight: "700" },
  searchRow: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderWidth: 1.2,
    borderColor: "#E2D8CF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, color: "#3B2C1A" },

  // EDIT
  topBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 6,
  },
  topBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1.2, borderColor: "#E2D8CF",
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  topBtnText: { color: "#3B2C1A", fontWeight: "700" },
  content: { padding: 16, paddingBottom: 100 },
  section: { color: "#3B2C1A", fontWeight: "800", marginTop: 14, marginBottom: 6, fontSize: 16 },
  label: { color: "#4B2E0F", fontWeight: "600", marginBottom: 6, marginTop: 6 },
  input: {
    backgroundColor: "#fff", borderWidth: 1.3, borderColor: "#C7A98D", borderRadius: 10, padding: 10, color: "#4B2E0F", fontSize: 14,
  },
  btn: {
    borderRadius: 10, paddingVertical: 12, alignItems: "center", justifyContent: "center",
    flexDirection: "row",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
});

const rowStyles = StyleSheet.create({
  wrap: { flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 12 },
  preview: { width: 110, height: 110, borderRadius: 12 },
});

const centerPick = StyleSheet.create({
  wrap: { alignItems: "center", marginBottom: 10 },
  title: { color: "#4B2E0F", fontWeight: "600", marginBottom: 6 },
  preview: { width: 120, height: 120, borderRadius: 14 },
});

const card = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2D8CF",
    padding: 12,
  },
  avatarWrap: { alignItems: "center", marginBottom: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#EEE" },
  name: { color: "#3B2C1A", fontWeight: "700" },
  cpf: { color: "#7A6A59", fontSize: 12 },
  actions: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C7A98D",
    gap: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  actionsText: { color: BROWN, fontWeight: "700", fontSize: 12 },
});

/* header */
const appHeaderStyles = StyleSheet.create({
  appHeader: {
    flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 15,
    backgroundColor: "#FAF7F2", borderBottomWidth: 1, borderBottomColor: "#E2D8CF",
  },
  appLogo: { width: 42, height: 42, marginRight: 10, resizeMode: "contain", borderRadius: 21 },
  appTitle: { fontSize: 20, fontWeight: "700", color: "#3A2C1F" },
});

/* modal rotina */
const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  card: {
    width: "94%",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2D8CF",
    padding: 14,
  },
  title: { fontSize: 18, fontWeight: "800", color: "#3B2C1A", textAlign: "center" },
  subtitle: { textAlign: "center", color: "#7E6A57", marginTop: 4, marginBottom: 10 },
  emptyBox: {
    borderWidth: 1, borderColor: "#EAD7C4", borderRadius: 12, padding: 14,
    backgroundColor: "#FFF8F0", alignItems: "center", gap: 6, marginBottom: 8,
  },
  emptyText: { color: "#6B543F" },
  dayCard: {
    borderWidth: 1, borderColor: "#E2D8CF", borderRadius: 12, padding: 10, backgroundColor: "#FFFEFD", marginBottom: 10,
  },
  dayHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dayTitle: { color: "#3B2C1A", fontWeight: "800" },
  medsLabel: { color: "#4B2E0F", fontWeight: "700", marginTop: 10, marginBottom: 6 },
  medsRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6, marginTop: 2 },
  iconBtn: { padding: 4 },
  actions: { flexDirection: "row", gap: 10, marginTop: 10 },
});
