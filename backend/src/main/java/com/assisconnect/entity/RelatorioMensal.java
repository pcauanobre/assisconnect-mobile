package com.assisconnect.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.Map;

@Entity
@Table(name = "relatorios_mensais")
public class RelatorioMensal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int mes;
    private int ano;
    private int quantidadeIdosos;

    private String observacoes;

    @ElementCollection
    @CollectionTable(name = "checklist_mensal", joinColumns = @JoinColumn(name = "relatorio_id"))
    @MapKeyColumn(name = "item")
    @Column(name = "concluido")
    private Map<String, Boolean> checklist;

    private LocalDate dataCriacao = LocalDate.now();

    // Getters e Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getMes() {
        return mes;
    }

    public void setMes(int mes) {
        this.mes = mes;
    }

    public int getAno() {
        return ano;
    }

    public void setAno(int ano) {
        this.ano = ano;
    }

    public int getQuantidadeIdosos() {
        return quantidadeIdosos;
    }

    public void setQuantidadeIdosos(int quantidadeIdosos) {
        this.quantidadeIdosos = quantidadeIdosos;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public Map<String, Boolean> getChecklist() {
        return checklist;
    }

    public void setChecklist(Map<String, Boolean> checklist) {
        this.checklist = checklist;
    }

    public LocalDate getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDate dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
}
