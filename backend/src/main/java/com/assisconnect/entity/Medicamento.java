package com.assisconnect.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "medicamentos")
public class Medicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "idoso_id", nullable = false)
    private Long idosoId;

    private String nome;
    private String dosagem;
    private String horarios;
    private String frequencia;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(name = "data_cadastro")
    private LocalDate dataCadastro;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdosoId() { return idosoId; }
    public void setIdosoId(Long idosoId) { this.idosoId = idosoId; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDosagem() { return dosagem; }
    public void setDosagem(String dosagem) { this.dosagem = dosagem; }

    public String getHorarios() { return horarios; }
    public void setHorarios(String horarios) { this.horarios = horarios; }

    public String getFrequencia() { return frequencia; }
    public void setFrequencia(String frequencia) { this.frequencia = frequencia; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }

    public LocalDate getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDate dataCadastro) { this.dataCadastro = dataCadastro; }
}
