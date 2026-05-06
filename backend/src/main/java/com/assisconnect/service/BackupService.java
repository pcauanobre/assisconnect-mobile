package com.assisconnect.service;

import com.assisconnect.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class BackupService {

    private final IdosoRepository idosoRepository;
    private final UsuarioRepository usuarioRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final RegistroSaudeRepository registroSaudeRepository;
    private final VisitaRepository visitaRepository;
    private final AtividadeRepository atividadeRepository;
    private final CardapioRepository cardapioRepository;
    private final RelatorioMensalRepository relatorioMensalRepository;

    public BackupService(
            IdosoRepository idosoRepository,
            UsuarioRepository usuarioRepository,
            MedicamentoRepository medicamentoRepository,
            RegistroSaudeRepository registroSaudeRepository,
            VisitaRepository visitaRepository,
            AtividadeRepository atividadeRepository,
            CardapioRepository cardapioRepository,
            RelatorioMensalRepository relatorioMensalRepository) {
        this.idosoRepository = idosoRepository;
        this.usuarioRepository = usuarioRepository;
        this.medicamentoRepository = medicamentoRepository;
        this.registroSaudeRepository = registroSaudeRepository;
        this.visitaRepository = visitaRepository;
        this.atividadeRepository = atividadeRepository;
        this.cardapioRepository = cardapioRepository;
        this.relatorioMensalRepository = relatorioMensalRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> gerarBackupCompleto() {
        Map<String, Object> backup = new LinkedHashMap<>();
        backup.put("idosos", idosoRepository.findAll());
        backup.put("usuarios", usuarioRepository.findAll());
        backup.put("medicamentos", medicamentoRepository.findAll());
        backup.put("registrosSaude", registroSaudeRepository.findAll());
        backup.put("visitas", visitaRepository.findAll());
        backup.put("atividades", atividadeRepository.findAll());
        backup.put("cardapio", cardapioRepository.findAll());
        backup.put("relatorios", relatorioMensalRepository.findAll());
        return backup;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> gerarResumo() {
        Map<String, Object> resumo = new LinkedHashMap<>();
        resumo.put("totalIdosos", idosoRepository.count());
        resumo.put("totalUsuarios", usuarioRepository.count());
        resumo.put("totalMedicamentos", medicamentoRepository.count());
        resumo.put("totalRegistrosSaude", registroSaudeRepository.count());
        resumo.put("totalVisitas", visitaRepository.count());
        resumo.put("totalAtividades", atividadeRepository.count());
        resumo.put("totalRelatorios", relatorioMensalRepository.count());
        return resumo;
    }
}
