// client/screens/Admin/AdminScreen.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image, FlatList, Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Appheader from "../../components/Appheader";

import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp,
  updateDoc, where, setDoc, orderBy, limit
} from "firebase/firestore";
import { db, storage } from "../../services/firebaseConfig";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

/* --------------------------------------------------------------------------------
   Helpers
-------------------------------------------------------------------------------- */

const BROWN = "#3A1F0F";
const todayISO = () => new Date().toISOString().slice(0, 10);

const onlyDigits = (v = "") => String(v).replace(/\D/g, "");
const formatCpf = (v = "") => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length < 11) return d;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
};
const isValidEmail = (e = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(e).trim());

async function pickImage() {
  const { status } = await (await import("expo-image-picker")).requestMediaLibraryPermissionsAsync();
  if (status !== "granted") { Alert.alert("Permissão", "Precisamos de acesso à galeria para continuar."); return null; }
  const res = await (await import("expo-image-picker")).launchImageLibraryAsync({
    mediaTypes: (await import("expo-image-picker")).MediaTypeOptions.Images, quality: 0.85,
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

/* --------- Random utils ---------- */
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
const randomCPFdigits = () => String(randInt(10000000000, 99999999999));
const randomFotoUrl = () => `https://i.pravatar.cc/300?img=${randInt(1, 70)}`;
const randomNome = (genero = null) => {
  const base = genero?.toLowerCase().startsWith("f") ? nomesF : genero?.toLowerCase().startsWith("m") ? nomesM : [...nomesF, ...nomesM];
  return `${pick(base)} ${pick(sobres)} ${pick(sobres)}`;
};
const randomDate = (minYear = 1940, maxYear = 2005) => {
  const y = randInt(minYear, maxYear);
  const m = String(randInt(1, 12)).padStart(2, "0");
  const d = String(randInt(1, 28)).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
const randomPhone = () => `+55 ${String(randInt(11, 99))} 9${String(randInt(1000,9999))}-${String(randInt(1000,9999))}`;
const randomCondicoesCSV = () => {
  const all = ["Hipertensão","Diabetes","Artrose","Osteoporose","Asma","Depressão","Insônia"];
  const n = randInt(1, 3);
  const s = new Set();
  while (s.size < n) s.add(pick(all));
  return Array.from(s).join(",");
};
const randomMedsText = () => {
  const meds = [
    { nome: "Losartana", dose: "50mg" },
    { nome: "Metformina", dose: "500mg" },
    { nome: "Atenolol", dose: "25mg" },
    { nome: "Sinvastatina", dose: "10mg" },
    { nome: "Paracetamol", dose: "500mg" },
  ];
  const itens = randInt(2, 3);
  return Array(itens).fill(0).map(() => {
    const m = pick(meds);
    const h = `${String(randInt(7, 20)).padStart(2, "0")}:${pick(["00","15","30","45"])}`;
    return `${m.nome} ${m.dose} - ${h}`;
  }).join("; ");
};

/* --------------------------------------------------------------------------------
   Form defaults
-------------------------------------------------------------------------------- */

const NEW_USER = () => ({
  nome: "",
  cpf: "",
  data_nascimento: "",
  email: "",
  telefone: "",
  sexo: "",            // ✅ novo campo
  parentesco: "",      // ✅ novo campo
});


const NEW_ELDER = () => ({
  cpf: "",
  nome: "",
  genero: "",
  dataNascimento: "",
  altura_cm: "",
  peso_kg: "",
  condicoes: "",
  cep: "",
  cidade: "",
  estado: "",
  rua: "",
  telefoneIdoso: "",
  fotoPerfilUrl: "",
  rgUrl: "",
  vacinaUrl: "",
  susUrl: "",
  dataDiaISO: todayISO(),
  presenca: "Confirmada",
  responsavelDoDia: "",
  humorNivel: "3",
  medicamentosTexto: "",
  alimentacao: "",
  comentarios: "",
});

/* --------------------------------------------------------------------------------
   Screen
-------------------------------------------------------------------------------- */

export default function AdminScreen() {
  // modos: list | form
  const [mode, setMode] = useState("list");
  // steps: 1 (usuario), 2 (idoso)
  const [step, setStep] = useState(1);

  // responsável
  const [user, setUser] = useState(NEW_USER());
  const [usuarioId, setUsuarioId] = useState(null); // doc id do responsável (ou null)

  // idoso
  const [elder, setElder] = useState(NEW_ELDER());
  const [elderId, setElderId] = useState(null); // quando editar

  // Modal e rotinas
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [rotinas, setRotinas] = useState([]);

  // ⬇️ SUBSTITUA sua função addRandomRoutine por esta
  const addRandomRoutine = () => {
    const baseDate = new Date();
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + rotinas.length);
    const dataISO = nextDate.toISOString().slice(0, 10);

    const nova = {
      dataISO,
      presenca: pick(["Confirmada", "Ausente", "Em atraso"]),
      responsavelDoDia: randomNome(),
      humorNivel: String(randInt(1, 5)),
      medicamentosTexto: randomMedsText(),
      alimentacao: pick(["Almoçou bem","Comeu pouco","Recusou jantar","Lanche leve","Hidratou bem"]),
      expandido: false,
    };
    setRotinas((prev) => [...prev, nova]);
  };


  const toggleExpand = (i) => {
    setRotinas((prev) =>
      prev.map((r, idx) =>
        idx === i ? { ...r, expandido: !r.expandido } : r
      )
    );
  };

  // ⬇️ remove um card de rotina pelo índice
  const removeRoutine = (i) => {
    setRotinas((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ⬇️ converte "Medicamento X 10mg - 08:00; ..." em array {nome,dose,horario}
  const parseMeds = (medsTexto = "") =>
    String(medsTexto)
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((linha) => {
        const [esq, horario] = linha.split("-").map((t) => t.trim());
        const partes = (esq || "").split(" ");
        const dose = partes.length > 1 ? partes[partes.length - 1] : "-";
        const nome = partes.length > 1 ? partes.slice(0, -1).join(" ") : (esq || "-");
        return { nome, dose, horario: horario || "" };
      });

  // ⬇️ salva TODAS as rotinas do modal na subcoleção pessoaIdosa/{id}/dias/{dataISO}
  const persistRotinas = async (elderDocId) => {
    if (!elderDocId || !rotinas?.length) return;
    const batchWrites = rotinas.slice(0, 5).map((r) => {
      const dataISO = r.dataISO;
      const nivel = Math.min(5, Math.max(1, Number(r.humorNivel || 3)));
      const medicamentosDia = parseMeds(r.medicamentosTexto || "");

      return setDoc(
        doc(db, "pessoaIdosa", elderDocId, "dias", dataISO),
        sanitize({
          dataISO,
          presenca: (r.presenca || "").trim(),
          responsavelDoDia: (r.responsavelDoDia || "").trim(),
          humorNivel: nivel,
          medicamentosDia,
          alimentacao: (r.alimentacao || "").trim(),
          comentarios: (r.comentarios || "").trim?.() || "",
          ultimaSync: serverTimestamp(),
        }),
        { merge: true }
      );
    });

    await Promise.all(batchWrites);
  };



  const [fotoPerfilLocal, setFotoPerfilLocal] = useState(null);
  const [rgLocal, setRgLocal] = useState(null);
  const [vacinaLocal, setVacinaLocal] = useState(null);
  const [susLocal, setSusLocal] = useState(null);

  // lista
  const [rows, setRows] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [q, setQ] = useState("");

  // previews
  const idosoPreviewUri = fotoPerfilLocal || (elder.fotoPerfilUrl?.trim() || "");
  const rgPreviewUri = rgLocal || (elder.rgUrl?.trim() || "");
  const vacinaPreviewUri = vacinaLocal || (elder.vacinaUrl?.trim() || "");
  const susPreviewUri = susLocal || (elder.susUrl?.trim() || "");

  const canGoNext = useMemo(() => {
    if (step === 1) {
      return (
        user.nome.trim() &&
        onlyDigits(user.cpf).length === 11 &&
        user.data_nascimento &&
        isValidEmail(user.email) &&
        user.telefone.trim() &&
        user.sexo && user.sexo !== "—" &&
        user.parentesco && user.parentesco !== "—"
      );
    }
    if (step === 2) {
      return elder.nome.trim() && onlyDigits(elder.cpf).length === 11;
    }
    return false;
  }, [step, user, elder]);



  /* ---------------------------------------------
     Randomizers
  --------------------------------------------- */
  const randomizeUser = () => {
    const nome = randomNome();
    setUser({
      nome,
      cpf: randomCPFdigits(),
      data_nascimento: randomDate(1970, 2000),
      email: `${nome.toLowerCase().split(" ").join(".")}@gmail.com`,
      telefone: randomPhone(),
      sexo: pick(["Masculino", "Feminino"]),
      parentesco: pick(["Filho(a)", "Neto(a)", "Sobrinho(a)", "Cônjuge", "Outro"]),
    });
  };

  const randomizeElder = () => {
    const { cidade, estado } = pick(cidades);
    setElder((p) => ({
      ...p,
      cpf: randomCPFdigits(),
      nome: randomNome(),
      genero: pick(["Feminino","Masculino"]),
      dataNascimento: randomDate(1935, 1965),
      altura_cm: String(randInt(145, 180)),
      peso_kg: String(randInt(45, 95)),
      condicoes: randomCondicoesCSV(),
      cep: `${randInt(10000, 99999)}-${String(randInt(100, 999))}`,
      cidade, estado, rua: `Rua ${randInt(1,999)}`,
      telefoneIdoso: randomPhone(),
      fotoPerfilUrl: randomFotoUrl(),
      dataDiaISO: todayISO(),
      presenca: pick(["Confirmada","Ausente","Em atraso"]),
      responsavelDoDia: randomNome(),
      humorNivel: String(randInt(1, 5)),
      medicamentosTexto: randomMedsText(),
      alimentacao: pick(["Almoçou bem","Comeu pouco","Recusou jantar"]),
      comentarios: pick(["Fez caminhada", "Conversou com psicóloga", "Jogou dominó"]),
    }));
    setFotoPerfilLocal(null); setRgLocal(null); setVacinaLocal(null); setSusLocal(null);
  };

  /* ---------------------------------------------
     Listagem
  --------------------------------------------- */
  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      // 🔹 Faz só 2 queries em vez de N+1
      const [idososSnap, usuariosSnap] = await Promise.all([
        getDocs(collection(db, "pessoaIdosa")),
        getDocs(collection(db, "usuarios")),
      ]);

      // 🔹 Cria mapa dos responsáveis por idosoRef
      const usuariosMap = {};
      usuariosSnap.docs.forEach((u) => {
        const data = u.data();
        if (data.idosoRef) usuariosMap[data.idosoRef] = { id: u.id, ...data };
      });

      // 🔹 Monta lista de idosos + responsável
      const arr = idososSnap.docs.map((d) => {
        const data = d.data() || {};
        const resp = usuariosMap[`pessoaIdosa/${d.id}`];
        return {
          id: d.id,
          nome: data?.nome || "—",
          cpf: data?.cpf || "—",
          fotoUrl: data?.fotoUrl || null,
          responsavelNome: resp?.nome || null,
          responsavelCpf: resp?.cpf || "—",
          usuarioId: resp?.id || null,
        };
      });

      arr.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
      setRows(arr);
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Falha ao carregar lista.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { if (mode === "list") loadList(); }, [mode, loadList]);

  const filteredRows = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(r =>
      (r.nome || "").toLowerCase().includes(t) ||
      (r.cpf || "").toLowerCase().includes(t) ||
      (r.responsavelNome || "").toLowerCase().includes(t)
    );
  }, [rows, q]);

  /* ---------------------------------------------
     Open NEW / EDIT
  --------------------------------------------- */
  const openNew = () => {
    setUser(NEW_USER());
    setUsuarioId(null);
    setElder(NEW_ELDER());
    setElderId(null);
    setStep(1);
    setMode("form");
  };

  const openEdit = async (id) => {
    try {
      // Doc principal do idoso
      const pRef = doc(db, "pessoaIdosa", id);
      const pSnap = await getDoc(pRef);
      if (!pSnap.exists()) return Alert.alert("Atenção", "Cadastro do idoso não encontrado.");
      const p = pSnap.data() || {};

      // Responsável vinculado
      const sResp = await getDocs(
        query(collection(db, "usuarios"), where("idosoRef", "==", `pessoaIdosa/${id}`))
      );
      let u = null;
      if (!sResp.empty) { const d = sResp.docs[0]; u = { id: d.id, ...(d.data() || {}) }; }

      // Carrega rotina do dia: tenta HOJE, senão pega o mais recente
      const hoje = todayISO();
      let rotina = null;

      const snapHoje = await getDoc(doc(db, "pessoaIdosa", id, "dias", hoje));
      if (snapHoje.exists()) {
        rotina = snapHoje.data();
      } else {
        const qLast = query(collection(db, "pessoaIdosa", id, "dias"), orderBy("dataISO", "desc"), limit(1));
        const sLast = await getDocs(qLast);
        if (!sLast.empty) rotina = sLast.docs[0].data();
      }

      // Preenche formulários do responsável (inclui sexo e parentesco)
      setUser({
        nome: u?.nome || "",
        cpf: onlyDigits(u?.cpf || ""),
        data_nascimento: u?.data_nascimento || "",
        email: u?.email || "",
        telefone: u?.telefone || "",
        sexo: u?.sexo || "",
        parentesco: u?.parentesco || "",
      });
      setUsuarioId(u?.id || null);

      // Preenche dados do idoso
      setElder({
        cpf: onlyDigits(p?.cpf || ""),
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
        telefoneIdoso: p?.contato?.telefone || "",
        fotoPerfilUrl: p?.fotoUrl || "",
        rgUrl: p?.documentos?.rgUrl || "",
        vacinaUrl: p?.documentos?.vacinaUrl || "",
        susUrl: p?.documentos?.susUrl || "",
        // Rotina do dia (prefill)
        dataDiaISO: rotina?.dataISO || hoje,
        presenca: rotina?.presenca || "Confirmada",
        responsavelDoDia: rotina?.responsavelDoDia || "",
        humorNivel: String(rotina?.humorNivel ?? 3),
        medicamentosTexto: (rotina?.medicamentosDia || [])
          .map(m => `${m.nome} ${m.dose} - ${m.horario}`)
          .join("; "),
        alimentacao: rotina?.alimentacao || "",
        comentarios: rotina?.comentarios || "",
      });

      setFotoPerfilLocal(null); setRgLocal(null); setVacinaLocal(null); setSusLocal(null);
      setElderId(id);
      setStep(1);
      setMode("form");
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Falha ao abrir para edição.");
    }
  };

  /* ---------------------------------------------
     Delete (unlink user + delete dias + delete storage)
  --------------------------------------------- */
  const handleDelete = async (id) => {
    // 1) ⚡ Remove da UI imediatamente (antes de qualquer await)
    setRows(prev => prev.filter(r => r.id !== id));

    try {
      // 2) Prepara tarefas pesadas EM PARALELO (sem bloquear a UI)
      const desvincularUsuarioP = (async () => {
        const sResp = await getDocs(
          query(collection(db, "usuarios"), where("idosoRef", "==", `pessoaIdosa/${id}`))
        );
        if (!sResp.empty) {
          await updateDoc(doc(db, "usuarios", sResp.docs[0].id), {
            idosoRef: null,
            updatedAt: serverTimestamp(),
          });
        }
      })();

      const apagarDiasP = (async () => {
        const diasSnap = await getDocs(collection(db, "pessoaIdosa", id, "dias"));
        // apaga todos os docs da subcoleção em paralelo
        await Promise.allSettled(
          diasSnap.docs.map(d => deleteDoc(doc(db, "pessoaIdosa", id, "dias", d.id)))
        );
      })();

      const apagarArquivosP = Promise.allSettled([
        deleteObject(ref(storage, `pessoaIdosa/${id}/perfil.jpg`)),
        deleteObject(ref(storage, `pessoaIdosa/${id}/docs/rg.jpg`)),
        deleteObject(ref(storage, `pessoaIdosa/${id}/docs/vacina.jpg`)),
        deleteObject(ref(storage, `pessoaIdosa/${id}/docs/sus.jpg`)),
      ]);

      const apagarDocPrincipalP = deleteDoc(doc(db, "pessoaIdosa", id));

      // 3) Espera todas concluírem, mas já removemos da UI
      await Promise.allSettled([
        desvincularUsuarioP,
        apagarDiasP,
        apagarArquivosP,
        apagarDocPrincipalP,
      ]);

      Alert.alert("✅ Sucesso", "Cadastro removido.");
      // opcional: confirma consistência depois
      loadList();

    } catch (e) {
      console.error("Erro ao excluir:", e);
      Alert.alert("Erro", "Não foi possível excluir por completo. Vou recarregar a lista.");
      // Se algo der ruim, ressincroniza a tela
      loadList();
    }
  };


  /* ---------------------------------------------
     Step 1: criar/usar/atualizar responsável
  --------------------------------------------- */
  const handleCreateOrUseUser = async () => {
    try {
      const cpfFmt = formatCpf(user.cpf);

      // validações
      if (!user.nome.trim()) return Alert.alert("Nome obrigatório", "Informe o nome completo.");
      if (onlyDigits(user.cpf).length !== 11) return Alert.alert("CPF inválido", "Informe um CPF com 11 dígitos.");
      if (!user.data_nascimento) return Alert.alert("Data de nascimento", "Informe a data de nascimento.");
      if (!isValidEmail(user.email)) return Alert.alert("E-mail inválido", "Informe um e-mail válido.");
      if (!user.telefone.trim()) return Alert.alert("Telefone obrigatório", "Informe o telefone.");
      if (!user.sexo || user.sexo === "—") return Alert.alert("Sexo", "Selecione o sexo.");
      if (!user.parentesco || user.parentesco === "—") return Alert.alert("Parentesco", "Informe o parentesco com a pessoa idosa.");

      const sexo = String(user.sexo).trim();
      const parentesco = String(user.parentesco).trim();

      // Atualiza se já existe
      if (usuarioId) {
        await updateDoc(doc(db, "usuarios", usuarioId), sanitize({
          nome: user.nome.trim(),
          data_nascimento: user.data_nascimento,
          cpf: cpfFmt,
          cpf_digits: onlyDigits(user.cpf),
          email: String(user.email).trim().toLowerCase(),
          telefone: user.telefone.trim(),
          sexo,
          parentesco,
          updatedAt: serverTimestamp(),
        }));
        Alert.alert("✅ Atualizado", "Responsável atualizado com sucesso.");
        setStep(2);
        return;
      }

      // Procura duplicado
      const q1 = query(collection(db, "usuarios"), where("cpf", "==", cpfFmt));
      const q2 = query(collection(db, "usuarios"), where("cpf_digits", "==", onlyDigits(user.cpf)));
      const q3 = query(collection(db, "usuarios"), where("email", "==", String(user.email).trim().toLowerCase()));
      const [s1, s2, s3] = await Promise.all([getDocs(q1), getDocs(q2), getDocs(q3)]);

      let existing = null;
      if (!s1.empty) existing = s1.docs[0];
      else if (!s2.empty) existing = s2.docs[0];
      else if (!s3.empty) existing = s3.docs[0];

      if (existing) {
        setUsuarioId(existing.id);
        Alert.alert("Responsável encontrado", "Vamos associar ou editar o idoso vinculado.");
        setStep(2);
        return;
      }

      // Cria novo
      const refUser = await addDoc(collection(db, "usuarios"), sanitize({
        nome: user.nome.trim(),
        data_nascimento: user.data_nascimento,
        cpf: cpfFmt,
        cpf_digits: onlyDigits(user.cpf),
        email: String(user.email).trim().toLowerCase(),
        telefone: user.telefone.trim(),
        sexo,
        parentesco,
        idosoRef: null,
        createdAt: serverTimestamp(),
      }));

      setUsuarioId(refUser.id);
      Alert.alert("✅ Sucesso", "Responsável cadastrado. Continue para o idoso.");
      setStep(2);

    } catch (e) {
      console.error("Erro handleCreateOrUseUser:", e);
      Alert.alert("Erro", String(e?.message || e));
    }
  };


  /* ---------------------------------------------
     Step 2: criar/atualizar idoso + rotina + vincular
  --------------------------------------------- */
  const handleSaveElderAndLink = async () => {
    try {
      if (!usuarioId) return Alert.alert("Fluxo inválido", "Crie/seleciona primeiro o responsável.");
      const cpfFmt = formatCpf(elder.cpf);
      if (onlyDigits(elder.cpf).length !== 11) return Alert.alert("CPF inválido (idoso)", "Informe 11 dígitos.");

      // Doc principal
      const basePayload = sanitize({
        nome: elder.nome.trim(),
        cpf: cpfFmt,
        genero: (elder.genero || "").trim(),
        dataNascimento: (elder.dataNascimento || "").trim(),
        altura_cm: Number(elder.altura_cm || 0),
        peso_kg: Number(elder.peso_kg || 0),
        condicoes: (elder.condicoes || "").split(",").map(s=>s.trim()).filter(Boolean),
        endereco: { cep: (elder.cep||"").trim(), cidade: (elder.cidade||"").trim(), estado: (elder.estado||"").trim(), rua: (elder.rua||"").trim() },
        contato: { telefone: (elder.telefoneIdoso||"").trim() },
        updatedAt: serverTimestamp(),
      });

      let id = elderId;
      if (!elderId) {
        const refNew = await addDoc(collection(db, "pessoaIdosa"), { ...basePayload, createdAt: serverTimestamp() });
        id = refNew.id;
      } else {
        await updateDoc(doc(db, "pessoaIdosa", elderId), basePayload);
      }

      // Imagens
      const fotoUrl   = fotoPerfilLocal ? await uploadToStorage(fotoPerfilLocal, `pessoaIdosa/${id}/perfil.jpg`)   : (elder.fotoPerfilUrl?.trim() || "");
      const rgUrl     = rgLocal        ? await uploadToStorage(rgLocal,        `pessoaIdosa/${id}/docs/rg.jpg`)   : (elder.rgUrl?.trim() || "");
      const vacinaUrl = vacinaLocal    ? await uploadToStorage(vacinaLocal,    `pessoaIdosa/${id}/docs/vacina.jpg`): (elder.vacinaUrl?.trim() || "");
      const susUrl    = susLocal       ? await uploadToStorage(susLocal,       `pessoaIdosa/${id}/docs/sus.jpg`)   : (elder.susUrl?.trim() || "");

      const patch = {};
      if (fotoUrl) patch.fotoUrl = fotoUrl;
      const docsPatch = {};
      if (rgUrl) docsPatch.rgUrl = rgUrl;
      if (vacinaUrl) docsPatch.vacinaUrl = vacinaUrl;
      if (susUrl) docsPatch.susUrl = susUrl;
      if (Object.keys(docsPatch).length) patch.documentos = docsPatch;
      if (Object.keys(patch).length) {
        patch.updatedAt = serverTimestamp();
        await updateDoc(doc(db, "pessoaIdosa", id), patch);
      }

      // ⬇️ NOVO: se houver rotinas criadas no modal, persiste agora
      if (rotinas && rotinas.length) {
        try {
          await persistRotinas(id);
        } catch (e) {
          console.error("Falha ao salvar rotinas do modal:", e);
        }
      }

      // Rotina do dia (merge no doc com id = dataISO)
      const dataISO = (elder.dataDiaISO || todayISO()).trim();
      if (dataISO) {
        const nivel = Math.min(5, Math.max(1, Number(elder.humorNivel || 3)));
        const medicamentosDia = (elder.medicamentosTexto || "")
          .split(";").map(s=>s.trim()).filter(Boolean)
          .map((linha) => {
            const [esq, horario] = linha.split("-").map(t=>t.trim());
            const partes = (esq||"").split(" ");
            const dose = partes.length>1 ? partes[partes.length-1] : "-";
            const nome = partes.length>1 ? partes.slice(0,-1).join(" ") : (esq||"-");
            return { nome, dose, horario: horario || "" };
          });

        await setDoc(
          doc(db, "pessoaIdosa", id, "dias", dataISO),
          sanitize({
            dataISO,
            presenca: (elder.presenca || "").trim(),
            responsavelDoDia: (elder.responsavelDoDia || "").trim(),
            humorNivel: nivel,
            medicamentosDia,
            alimentacao: (elder.alimentacao || "").trim(),
            comentarios: (elder.comentarios || "").trim(),
            ultimaSync: serverTimestamp(),
          }),
          { merge: true }
        );
      }

      // Vincular usuário → idoso
      await updateDoc(doc(db, "usuarios", usuarioId), {
        idosoRef: `pessoaIdosa/${id}`,
        updatedAt: serverTimestamp(),
      });

    Alert.alert("✅ Sucesso", elderId ? "Cadastro atualizado." : "Responsável e idoso cadastrados e vinculados.");
    setMode("list");
    setStep(1);
    setUser(NEW_USER());
    setElder(NEW_ELDER());
    setElderId(null);
    setUsuarioId(null);
    setFotoPerfilLocal(null);
    setRgLocal(null);
    setVacinaLocal(null);
    setSusLocal(null);

    // ⏳ dá tempo do Firestore propagar
    setTimeout(() => {
      loadList();
    }, 1200);

    } catch (e) {
      console.error(e);
      Alert.alert("Erro", String(e?.message || e));
    }
  };

  /* ---------------------------------------------
     Render
  --------------------------------------------- */

  if (mode === "list") {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <Appheader styles={appHeaderStyles} />

        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={styles.title}>Idosos cadastrados</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: BROWN, paddingHorizontal: 12 }]} onPress={openNew}>
              <Feather name="plus" size={16} color="#fff" />
              <Text style={[styles.btnText, { marginLeft: 8 }]}>Novo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <Feather name="search" size={18} color="#8A7B6A" />
            <TextInput
              placeholder="Buscar por nome, CPF ou responsável"
              placeholderTextColor="#B29F8D"
              style={styles.searchInput}
              value={q}
              onChangeText={setQ}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={loadList} style={{ paddingHorizontal: 8 }}>
              <Feather name="refresh-cw" size={18} color={loadingList ? "#B29F8D" : BROWN} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredRows}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 8 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <View style={card.card}>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {item.fotoUrl ? (
                    <Image source={{ uri: item.fotoUrl }} style={card.avatar} />
                  ) : (
                    <View style={[card.avatar, { backgroundColor: "#EEE" }]} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={card.name}>{item.nome}</Text>
                    <Text style={card.meta}>{item.cpf}</Text>
                    <Text style={card.meta}>CPF do Responsável: {item.responsavelCpf || "—"}</Text>
                    <Text style={card.meta}>Responsável: {item.responsavelNome || "—"}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  <TouchableOpacity style={[styles.btn, { flex: 1, backgroundColor: "#6D4C41" }]} onPress={() => openEdit(item.id)}>
                    <Feather name="edit-2" size={16} color="#fff" />
                    <Text style={[styles.btnText, { marginLeft: 8 }]}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, { flex: 1, backgroundColor: "#C62828" }]}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Feather name="trash-2" size={16} color="#fff" />
                    <Text style={[styles.btnText, { marginLeft: 8 }]}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    );
  }

  // FORM (2 páginas)
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <Appheader styles={appHeaderStyles} />

      {/* Stepper header */}
      <View style={styles.stepper}>
        <StepDot active={step === 1} label="1. Responsável" />
        <View style={styles.stepLine} />
        <StepDot active={step === 2} label="2. Idoso" />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step === 1 ? (
          <>
            <Text style={styles.title}>{usuarioId ? "Editar Responsável" : "Cadastrar Responsável"}</Text>

            <Field label="Nome completo" value={user.nome} onChange={(v)=>setUser((p)=>({ ...p, nome: v }))} />
            <Field label="CPF (somente números)" value={onlyDigits(user.cpf)} onChange={(v)=>setUser((p)=>({ ...p, cpf: onlyDigits(v) }))} keyboardType="number-pad" />
            <Field label="Data de Nascimento (AAAA-MM-DD)" value={user.data_nascimento} onChange={(v)=>setUser((p)=>({ ...p, data_nascimento: v }))} />
            <Field label="E-mail" value={user.email} onChange={(v)=>setUser((p)=>({ ...p, email: v }))} autoCapitalize="none" keyboardType="email-address" />
            <Field label="Telefone (+55 XX 9XXXX-XXXX)" value={user.telefone} onChange={(v)=>setUser((p)=>({ ...p, telefone: v }))} keyboardType="phone-pad" />
            <Field
              label="Sexo (Masculino / Feminino)"
              value={user.sexo}
              onChange={(v) => setUser((p) => ({ ...p, sexo: v }))}
              autoCapitalize="words"
            />

            <Field
              label="Parentesco com o idoso"
              value={user.parentesco}
              onChange={(v) => setUser((p) => ({ ...p, parentesco: v }))}
              autoCapitalize="words"
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: BROWN, flex: 1 }]} onPress={randomizeUser}>
                <Feather name="shuffle" size={16} color="#fff" />
                <Text style={[styles.btnText, { marginLeft: 8 }]}>Randomizar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: "#666", flex: 1 }]} onPress={()=>setMode("list")}>
                <Feather name="arrow-left" size={16} color="#fff" />
                <Text style={[styles.btnText, { marginLeft: 8 }]}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: canGoNext ? "#2E7D32" : "#A5D6A7", flex: 1 }]}
                disabled={!canGoNext}
                onPress={handleCreateOrUseUser}
              >
                <Feather name="arrow-right" size={16} color="#fff" />
                <Text style={[styles.btnText, { marginLeft: 8 }]}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>{elderId ? "Editar Idoso" : "Cadastrar Idoso"}</Text>

            {/* Foto */}
            <Text style={styles.section}>Foto do Idoso</Text>
            <CenteredPickPreview
              title="Pré-visualização"
              uri={idosoPreviewUri}
              onPick={async () => { const uri = await pickImage(); if (!uri) return; setFotoPerfilLocal(uri); }}
            />
            <Text style={styles.label}>URL da Foto (opcional)</Text>
            <TextInput style={styles.input} placeholder="https://..." value={elder.fotoPerfilUrl} onChangeText={(t)=>{ setFotoPerfilLocal(null); setElder((p)=>({ ...p, fotoPerfilUrl: t })); }} autoCapitalize="none" />

            {/* Docs */}
            <Text style={styles.section}>Documentos (imagens)</Text>
            <Label text="RG" />
            <RowPickPreview uri={rgPreviewUri} onPick={async () => setRgLocal(await pickImage())} />
            <TextInput style={styles.input} placeholder="URL do RG (opcional)" value={elder.rgUrl} onChangeText={(t)=>{ setRgLocal(null); setElder((p)=>({ ...p, rgUrl: t })); }} autoCapitalize="none" />
            <Label text="Carteira de Vacinação" />
            <RowPickPreview uri={vacinaPreviewUri} onPick={async () => setVacinaLocal(await pickImage())} />
            <TextInput style={styles.input} placeholder="URL da vacina (opcional)" value={elder.vacinaUrl} onChangeText={(t)=>{ setVacinaLocal(null); setElder((p)=>({ ...p, vacinaUrl: t })); }} autoCapitalize="none" />
            <Label text="Cartão do SUS" />
            <RowPickPreview uri={susPreviewUri} onPick={async () => setSusLocal(await pickImage())} />
            <TextInput style={styles.input} placeholder="URL do SUS (opcional)" value={elder.susUrl} onChangeText={(t)=>{ setSusLocal(null); setElder((p)=>({ ...p, susUrl: t })); }} autoCapitalize="none" />

            {/* Dados do idoso */}
            <Text style={styles.section}>Dados do Idoso</Text>
            <Field label="CPF (somente números)" value={onlyDigits(elder.cpf)} onChange={(v)=>setElder((p)=>({ ...p, cpf: onlyDigits(v) }))} keyboardType="number-pad" />
            <Field label="Nome completo" value={elder.nome} onChange={(v)=>setElder((p)=>({ ...p, nome: v }))} />
            <Field label="Gênero" value={elder.genero} onChange={(v)=>setElder((p)=>({ ...p, genero: v }))} />
            <Field label="Data de Nascimento (AAAA-MM-DD)" value={elder.dataNascimento} onChange={(v)=>setElder((p)=>({ ...p, dataNascimento: v }))} />
            <Field label="Altura (cm)" value={String(elder.altura_cm)} onChange={(v)=>setElder((p)=>({ ...p, altura_cm: v }))} keyboardType="number-pad" />
            <Field label="Peso (kg)" value={String(elder.peso_kg)} onChange={(v)=>setElder((p)=>({ ...p, peso_kg: v }))} keyboardType="number-pad" />
            <Field label="Condições (separe por vírgula)" value={elder.condicoes} onChange={(v)=>setElder((p)=>({ ...p, condicoes: v }))} />

            {/* Endereço/contato */}
            <Text style={styles.section}>Endereço & Contato</Text>
            <Field label="CEP" value={elder.cep} onChange={(v)=>setElder((p)=>({ ...p, cep: v }))} />
            <Field label="Cidade" value={elder.cidade} onChange={(v)=>setElder((p)=>({ ...p, cidade: v }))} />
            <Field label="Estado (UF)" value={elder.estado} onChange={(v)=>setElder((p)=>({ ...p, estado: v }))} />
            <Field label="Rua e número" value={elder.rua} onChange={(v)=>setElder((p)=>({ ...p, rua: v }))} />
            <Field label="Telefone do Idoso" value={elder.telefoneIdoso} onChange={(v)=>setElder((p)=>({ ...p, telefoneIdoso: v }))} keyboardType="phone-pad" />

            {/* Rotina do dia */}
            <Text style={styles.section}>Rotina do Dia (opcional)</Text>
            <Field label="Data do Dia (AAAA-MM-DD)" value={elder.dataDiaISO} onChange={(v)=>setElder((p)=>({ ...p, dataDiaISO: v }))} />
            <Field label="Presença" value={elder.presenca} onChange={(v)=>setElder((p)=>({ ...p, presenca: v }))} />
            <Field label="Responsável do Dia" value={elder.responsavelDoDia} onChange={(v)=>setElder((p)=>({ ...p, responsavelDoDia: v }))} />
            <Field label="Humor do Dia (1–5)" value={String(elder.humorNivel)} onChange={(v)=>setElder((p)=>({ ...p, humorNivel: v }))} keyboardType="number-pad" />
            <Field label="Medicamentos do Dia (; entre itens)" value={elder.medicamentosTexto} onChange={(v)=>setElder((p)=>({ ...p, medicamentosTexto: v }))} />
            <Field label="Alimentação do Dia" value={elder.alimentacao} onChange={(v)=>setElder((p)=>({ ...p, alimentacao: v }))} />
            <Field label="Comentários do Dia" value={elder.comentarios} onChange={(v)=>setElder((p)=>({ ...p, comentarios: v }))} />

            {/* Botão para abrir modal de rotinas */}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: BROWN, marginVertical: 10 }]}
              onPress={() => setShowRoutineModal(true)}
            >
              <Feather name="calendar" size={16} color="#fff" />
              <Text style={[styles.btnText, { marginLeft: 8 }]}>Cadastrar Rotinas</Text>
            </TouchableOpacity>

            {/* Modal de rotina */}
            <Modal
              visible={showRoutineModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowRoutineModal(false)}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 16,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#FFF6ED",
                    width: "92%",
                    maxHeight: "70%",     // ⬅️ não ocupa a tela toda
                    borderRadius: 18,
                    padding: 16,
                    shadowColor: "#000",
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "800",
                      color: BROWN,
                      marginBottom: 10,
                      textAlign: "center",
                    }}
                  >
                    Rotinas do Idoso
                  </Text>

                  {/* ⬇️ só ativa scroll quando existir algo expandido */}
                  <ScrollView
                    scrollEnabled={rotinas.some(r => r.expandido)}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 10 }}
                  >
                    {rotinas.map((r, idx) => (
                      <View
                        key={idx}
                        style={{
                          backgroundColor: "#8B5A2B",
                          borderRadius: 12,
                          marginBottom: 10,
                          overflow: "hidden",
                        }}
                      >
                        {/* Cabeçalho compacto do card (com excluir) */}
                        <View
                          style={{
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => toggleExpand(idx)}
                            style={{ flex: 1 }}
                            activeOpacity={0.8}
                          >
                            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                              {r.dataISO}
                            </Text>
                          </TouchableOpacity>

                          {/* Excluir card */}
                          <TouchableOpacity
                            onPress={() => removeRoutine(idx)}
                            style={{
                              backgroundColor: "#C62828",
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 8,
                              marginRight: 6,
                            }}
                          >
                            <Feather name="trash-2" size={14} color="#fff" />
                          </TouchableOpacity>

                          {/* Expand/Collapse */}
                          <TouchableOpacity onPress={() => toggleExpand(idx)}>
                            <Feather
                              name={r.expandido ? "chevron-up" : "chevron-down"}
                              size={18}
                              color="#fff"
                            />
                          </TouchableOpacity>
                        </View>
                        {/* Corpo editável (aparece/ some) */}
                        {r.expandido && (
                          <View
                            style={{
                              backgroundColor: "#A47148",
                              padding: 10,
                              borderTopWidth: 1,
                              borderTopColor: "rgba(255,255,255,0.15)",
                              gap: 8,
                            }}
                          >
                            <Text style={{ color: "#fff" }}>Presença:</Text>
                            <TextInput
                              style={{
                                backgroundColor: "#fff",
                                borderRadius: 8,
                                padding: 8,
                              }}
                              value={r.presenca}
                              onChangeText={(t) =>
                                setRotinas((prev) =>
                                  prev.map((x, i) => (i === idx ? { ...x, presenca: t } : x))
                                )
                              }
                            />

                            <Text style={{ color: "#fff" }}>Responsável do Dia:</Text>
                            <TextInput
                              style={{
                                backgroundColor: "#fff",
                                borderRadius: 8,
                                padding: 8,
                              }}
                              value={r.responsavelDoDia}
                              onChangeText={(t) =>
                                setRotinas((prev) =>
                                  prev.map((x, i) =>
                                    i === idx ? { ...x, responsavelDoDia: t } : x
                                  )
                                )
                              }
                            />

                            <Text style={{ color: "#fff" }}>Humor (1–5):</Text>
                            <TextInput
                              style={{
                                backgroundColor: "#fff",
                                borderRadius: 8,
                                padding: 8,
                              }}
                              keyboardType="numeric"
                              value={r.humorNivel}
                              onChangeText={(t) =>
                                setRotinas((prev) =>
                                  prev.map((x, i) =>
                                    i === idx ? { ...x, humorNivel: t } : x
                                  )
                                )
                              }
                            />

                            <Text style={{ color: "#fff" }}>Medicamentos:</Text>
                            <TextInput
                              style={{
                                backgroundColor: "#fff",
                                borderRadius: 8,
                                padding: 8,
                              }}
                              multiline
                              value={r.medicamentosTexto}
                              onChangeText={(t) =>
                                setRotinas((prev) =>
                                  prev.map((x, i) =>
                                    i === idx ? { ...x, medicamentosTexto: t } : x
                                  )
                                )
                              }
                            />

                            <Text style={{ color: "#fff" }}>Alimentação:</Text>
                            <TextInput
                              style={{
                                backgroundColor: "#fff",
                                borderRadius: 8,
                                padding: 8,
                              }}
                              multiline
                              value={r.alimentacao || ""}
                              onChangeText={(t) =>
                                setRotinas((prev) =>
                                  prev.map((x, i) =>
                                    i === idx ? { ...x, alimentacao: t } : x
                                  )
                                )
                              }
                            />
                          </View>
                        )}
                      </View>
                    ))}
                  </ScrollView>

                  <TouchableOpacity
                    style={[
                      styles.btn,
                      {
                        backgroundColor: rotinas.length < 5 ? BROWN : "#ccc",
                        marginTop: 6,
                      },
                    ]}
                    disabled={rotinas.length >= 5}
                    onPress={addRandomRoutine}
                  >
                    <Feather name="plus-circle" size={16} color="#fff" />
                    <Text style={[styles.btnText, { marginLeft: 8 }]}>Adicionar Rotina</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: "#C62828", marginTop: 8 }]}
                    onPress={async () => {
                      try {
                        if (elderId) {
                          await persistRotinas(elderId); // salva imediatamente se já existe idoso
                          Alert.alert("✅ Rotinas salvas", "As rotinas foram salvas com sucesso.");
                        } else {
                          // ainda não existe doc do idoso; serão salvas ao clicar em "Salvar cadastro"
                          Alert.alert("Atenção", "As rotinas serão salvas quando você concluir o cadastro do idoso.");
                        }
                      } catch (e) {
                        console.error(e);
                        Alert.alert("Erro", "Não foi possível salvar as rotinas agora.");
                      } finally {
                        setShowRoutineModal(false);
                      }
                    }}
                  >
                    <Feather name="x" size={16} color="#fff" />
                    <Text style={[styles.btnText, { marginLeft: 8 }]}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>



            {/* Ações */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: BROWN, flex: 1 }]} onPress={randomizeElder}>
                <Feather name="shuffle" size={16} color="#fff" />
                <Text style={[styles.btnText, { marginLeft: 8 }]}>Randomizar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: "#666", flex: 1 }]} onPress={()=>setStep(1)}>
                <Feather name="arrow-left" size={16} color="#fff" />
                <Text style={[styles.btnText, { marginLeft: 8 }]}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: canGoNext ? "#2E7D32" : "#A5D6A7", flex: 1 }]}
                disabled={!canGoNext}
                onPress={handleSaveElderAndLink}
              >
                <Feather name="save" size={16} color="#fff" />
                <Text style={[styles.btnText, { marginLeft: 8 }]}>{elderId ? "Salvar alterações" : "Salvar cadastro"}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* --------------------------------------------------------------------------------
   UI helpers
-------------------------------------------------------------------------------- */

function StepDot({ active, label }) {
  return (
    <View style={{ alignItems: "center" }}>
      <View style={{
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: active ? BROWN : "#D8C7B6",
        borderWidth: 2, borderColor: active ? BROWN : "#D8C7B6",
      }}/>
      <Text style={{ marginTop: 6, fontWeight: "700", color: active ? BROWN : "#7A6A59" }}>{label}</Text>
    </View>
  );
}

function Field({ label, value, onChange, keyboardType = "default", autoCapitalize = "sentences" }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={String(value ?? "")}
        onChangeText={onChange}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

function Label({ text }) { return <Text style={[styles.label, { marginTop: 4 }]}>{text}</Text>; }

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

/* --------------------------------------------------------------------------------
   Styles
-------------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF6ED" },
  content: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: "800", color: "#3B2C1A", marginBottom: 8 },
  label: { color: "#4B2E0F", fontWeight: "600", marginBottom: 6 },
  input: {
    backgroundColor: "#fff", borderWidth: 1.3, borderColor: "#C7A98D",
    borderRadius: 10, padding: 10, color: "#4B2E0F", fontSize: 14,
  },
  btn: { borderRadius: 10, paddingVertical: 12, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  btnText: { color: "#fff", fontWeight: "bold" },

  stepper: {
    flexDirection: "row", alignItems: "center", gap: 12, justifyContent: "center",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#E2D8CF", backgroundColor: "#FAF7F2",
  },
  stepLine: { width: 40, height: 2, backgroundColor: "#E2D8CF", borderRadius: 2 },

  searchRow: {
    marginTop: 10, backgroundColor: "#fff", borderWidth: 1.2, borderColor: "#E2D8CF",
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  searchInput: { flex: 1, color: "#3B2C1A" },
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
  card: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#E2D8CF", padding: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#EEE" },
  name: { color: "#3B2C1A", fontWeight: "800" },
  meta: { color: "#7A6A59", fontSize: 12, marginTop: 2 },
});

const appHeaderStyles = StyleSheet.create({
  appHeader: {
    flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 15,
    backgroundColor: "#FAF7F2", borderBottomWidth: 1, borderBottomColor: "#E2D8CF",
  },
  appLogo: { width: 42, height: 42, marginRight: 10, resizeMode: "contain", borderRadius: 21 },
  appTitle: { fontSize: 20, fontWeight: "700", color: "#3A2C1F" },
});
