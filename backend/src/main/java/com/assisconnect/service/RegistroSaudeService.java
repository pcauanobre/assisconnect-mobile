package com.assisconnect.service;

import com.assisconnect.entity.RegistroSaude;
import com.assisconnect.repository.RegistroSaudeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class RegistroSaudeService {

    private final RegistroSaudeRepository repository;

    public RegistroSaudeService(RegistroSaudeRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public RegistroSaude cadastrar(RegistroSaude registro) {
        if (registro.getData() == null) {
            registro.setData(LocalDate.now());
        }
        return repository.save(registro);
    }

    @Transactional(readOnly = true)
    public List<RegistroSaude> listarPorIdoso(Long idosoId) {
        return repository.findByIdosoIdOrderByDataDesc(idosoId);
    }

    @Transactional(readOnly = true)
    public Optional<RegistroSaude> ultimoRegistro(Long idosoId) {
        return repository.findTop1ByIdosoIdOrderByDataDesc(idosoId);
    }

    @Transactional
    public Optional<RegistroSaude> atualizar(Long id, RegistroSaude dados) {
        return repository.findById(id).map(r -> {
            r.setData(dados.getData());
            r.setPeso(dados.getPeso());
            r.setPressaoSistolica(dados.getPressaoSistolica());
            r.setPressaoDiastolica(dados.getPressaoDiastolica());
            r.setTemperatura(dados.getTemperatura());
            r.setGlicemia(dados.getGlicemia());
            r.setObservacoes(dados.getObservacoes());
            return repository.save(r);
        });
    }

    @Transactional
    public boolean excluir(Long id) {
        if (!repository.existsById(id)) return false;
        repository.deleteById(id);
        return true;
    }
}
