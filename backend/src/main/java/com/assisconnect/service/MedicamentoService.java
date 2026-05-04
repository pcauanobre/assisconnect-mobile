package com.assisconnect.service;

import com.assisconnect.entity.Medicamento;
import com.assisconnect.repository.MedicamentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class MedicamentoService {

    private final MedicamentoRepository repository;

    public MedicamentoService(MedicamentoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Medicamento cadastrar(Medicamento medicamento) {
        if (medicamento.getDataCadastro() == null) {
            medicamento.setDataCadastro(LocalDate.now());
        }
        return repository.save(medicamento);
    }

    @Transactional(readOnly = true)
    public List<Medicamento> listarPorIdoso(Long idosoId, boolean apenasAtivos) {
        if (apenasAtivos) {
            return repository.findByIdosoIdAndAtivoTrueOrderByNomeAsc(idosoId);
        }
        return repository.findByIdosoIdOrderByNomeAsc(idosoId);
    }

    @Transactional(readOnly = true)
    public Optional<Medicamento> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Optional<Medicamento> atualizar(Long id, Medicamento dados) {
        return repository.findById(id).map(m -> {
            m.setNome(dados.getNome());
            m.setDosagem(dados.getDosagem());
            m.setHorarios(dados.getHorarios());
            m.setFrequencia(dados.getFrequencia());
            m.setObservacoes(dados.getObservacoes());
            m.setAtivo(dados.isAtivo());
            return repository.save(m);
        });
    }

    @Transactional
    public boolean excluir(Long id) {
        if (!repository.existsById(id)) return false;
        repository.deleteById(id);
        return true;
    }
}
