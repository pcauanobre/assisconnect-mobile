package com.assisconnect.service;

import com.assisconnect.entity.Visita;
import com.assisconnect.repository.IdosoRepository;
import com.assisconnect.repository.VisitaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class VisitaService {

    private final VisitaRepository visitaRepository;
    private final IdosoRepository idosoRepository;

    public VisitaService(VisitaRepository visitaRepository, IdosoRepository idosoRepository) {
        this.visitaRepository = visitaRepository;
        this.idosoRepository = idosoRepository;
    }

    @Transactional
    public Visita cadastrar(Visita visita) {
        if (visita.getDataVisita() == null) {
            visita.setDataVisita(LocalDate.now());
        }
        return visitaRepository.save(visita);
    }

    @Transactional(readOnly = true)
    public List<Visita> listarPorIdoso(Long idosoId) {
        return visitaRepository.findByIdosoIdOrderByDataVisitaDesc(idosoId);
    }

    @Transactional
    public Optional<Visita> atualizar(Long id, Visita dados) {
        return visitaRepository.findById(id).map(v -> {
            v.setDataVisita(dados.getDataVisita());
            v.setNomeVisitante(dados.getNomeVisitante());
            v.setParentesco(dados.getParentesco());
            v.setObservacoes(dados.getObservacoes());
            return visitaRepository.save(v);
        });
    }

    @Transactional
    public boolean excluir(Long id) {
        if (!visitaRepository.existsById(id)) return false;
        visitaRepository.deleteById(id);
        return true;
    }

    public List<Map<String, Object>> idososSemVisita(int dias) {
        LocalDate dataLimite = LocalDate.now().minusDays(dias);
        List<Long> idososComVisita = visitaRepository.findIdososComVisitaRecente(dataLimite);
        Set<Long> comVisitaSet = new HashSet<>(idososComVisita);

        return idosoRepository.findAll().stream()
                .filter(i -> !i.isInativo() && !i.isFalecido())
                .filter(i -> !comVisitaSet.contains(i.getId()))
                .map(i -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", i.getId());
                    map.put("nome", i.getNome());
                    map.put("fotoUrl", i.getFotoUrl());
                    Optional<Visita> ultima = visitaRepository.findTop1ByIdosoIdOrderByDataVisitaDesc(i.getId());
                    map.put("ultimaVisita", ultima.map(v -> v.getDataVisita().toString()).orElse(null));
                    return map;
                })
                .collect(Collectors.toList());
    }
}
