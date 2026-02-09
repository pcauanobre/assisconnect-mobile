package com.assisconnect.service;

import com.assisconnect.dto.IdosoDTO;
import com.assisconnect.entity.Idoso;
import com.assisconnect.repository.IdosoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IdosoService {

    @Autowired
    private IdosoRepository repository;

    public Idoso salvar(IdosoDTO dto) {
        Idoso idoso = new Idoso();
        preencherDados(idoso, dto);

        if (dto.dataCriacao != null && !dto.dataCriacao.isBlank()) {
            idoso.setDataCriacao(LocalDate.parse(dto.dataCriacao));
        }

        return repository.save(idoso);
    }

    public List<IdosoDTO> listarTodos() {
        return repository.findAll()
                .stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public IdosoDTO buscarPorId(Long id) {
        Idoso idoso = repository.findById(id).orElseThrow();
        return converterParaDTO(idoso);
    }

    public Idoso atualizar(Long id, IdosoDTO dto) {
        Idoso idoso = repository.findById(id).orElseThrow();
        preencherDados(idoso, dto);
        return repository.save(idoso);
    }

    public void excluir(Long id) {
        repository.deleteById(id);
    }

    public List<IdosoDTO> obterAniversariantesHoje() {
        LocalDate hoje = LocalDate.now();
        return repository.findAniversariantes(hoje.getDayOfMonth(), hoje.getMonthValue())
                .stream().map(this::converterParaDTO).collect(Collectors.toList());
    }

    public List<IdosoDTO> obterAniversariantesDoMes() {
        int mesAtual = LocalDate.now().getMonthValue();
        return repository.findByMesAniversario(mesAtual)
                .stream().map(this::converterParaDTO).collect(Collectors.toList());
    }

    private void preencherDados(Idoso idoso, IdosoDTO dto) {
        idoso.setNome(dto.nome);
        idoso.setSexo(dto.sexo);
        idoso.setDataNascimento(dto.dataNascimento);
        idoso.setEstadoCivil(dto.estadoCivil);
        idoso.setRg(dto.rg);
        idoso.setCpf(dto.cpf);
        idoso.setEndereco(dto.endereco);
        idoso.setCidade(dto.cidade);
        idoso.setEstado(dto.estado);
        idoso.setCep(dto.cep);
        idoso.setTelefoneIdoso(dto.telefoneIdoso);
        idoso.setResponsavel(dto.responsavel);
        idoso.setTelefoneResponsavel(dto.telefoneResponsavel);
        idoso.setDoencas(dto.doencas);
        idoso.setAlergias(dto.alergias);
        idoso.setPlanoSaude(dto.planoSaude);
        idoso.setDeficiencias(dto.deficiencias);
        idoso.setObservacoes(dto.observacoes);
        idoso.setFotoUrl(dto.fotoUrl);
        idoso.setInativo(dto.inativo);
        idoso.setFalecido(dto.falecido);
    }

    private IdosoDTO converterParaDTO(Idoso idoso) {
        IdosoDTO dto = new IdosoDTO();
        dto.id = idoso.getId();
        dto.nome = idoso.getNome();
        dto.sexo = idoso.getSexo();
        dto.dataNascimento = idoso.getDataNascimento();
        dto.estadoCivil = idoso.getEstadoCivil();
        dto.rg = idoso.getRg();
        dto.cpf = idoso.getCpf();
        dto.endereco = idoso.getEndereco();
        dto.cidade = idoso.getCidade();
        dto.estado = idoso.getEstado();
        dto.cep = idoso.getCep();
        dto.telefoneIdoso = idoso.getTelefoneIdoso();
        dto.responsavel = idoso.getResponsavel();
        dto.telefoneResponsavel = idoso.getTelefoneResponsavel();
        dto.doencas = idoso.getDoencas();
        dto.alergias = idoso.getAlergias();
        dto.planoSaude = idoso.getPlanoSaude();
        dto.deficiencias = idoso.getDeficiencias();
        dto.observacoes = idoso.getObservacoes();
        dto.fotoUrl = idoso.getFotoUrl();
        dto.dataCriacao = idoso.getDataCriacao() != null ? idoso.getDataCriacao().toString() : null;
        dto.inativo = idoso.isInativo();
        dto.falecido = idoso.isFalecido();
        return dto;
    }
}
