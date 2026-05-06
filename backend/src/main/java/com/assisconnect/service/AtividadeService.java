package com.assisconnect.service;

import com.assisconnect.entity.Atividade;
import com.assisconnect.repository.AtividadeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@SuppressWarnings("null")
public class AtividadeService {

    private final AtividadeRepository repository;

    public AtividadeService(AtividadeRepository repository) {
        this.repository = repository;
    }

    public Atividade salvarOuAtualizar(Atividade novaAtividade) {
        if (novaAtividade.getId() != null) {
            Atividade existente = repository.findById(novaAtividade.getId())
                    .orElseThrow(() -> new RuntimeException("Atividade não encontrada"));
            existente.setPresentes(novaAtividade.getPresentes());
            existente.setHoraRegistro(novaAtividade.getHoraRegistro());
            return repository.save(existente);
        }

        List<Atividade> existentes = repository.findByDataRegistroAndNome(
                novaAtividade.getDataRegistro(), novaAtividade.getNome());

        if (!existentes.isEmpty()) {
            Atividade existente = existentes.get(existentes.size() - 1);
            for (var novaPresenca : novaAtividade.getPresentes()) {
                boolean jaExiste = existente.getPresentes().stream()
                        .anyMatch(p -> p.getNome().equalsIgnoreCase(novaPresenca.getNome()));
                if (!jaExiste) {
                    existente.getPresentes().add(novaPresenca);
                }
            }
            return repository.save(existente);
        }

        return repository.save(novaAtividade);
    }

    public List<Atividade> listarPorDataOuTodas(String data, String nome) {
        if (data != null && nome != null) {
            return repository.findByDataRegistroAndNome(data, nome);
        } else if (data != null) {
            return repository.findByDataRegistro(data);
        }
        return repository.findAll();
    }

    public Atividade buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Atividade não encontrada"));
    }

    public List<Atividade> buscarAtividadesDeHoje() {
        return repository.findByDataRegistro(LocalDate.now().toString());
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
