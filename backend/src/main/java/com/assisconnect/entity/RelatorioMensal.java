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
    private int idososAtivos;
    private int idososInativos;
    private int idososFalecidos;
    private int novosCadastros;
    private double mediaIdade;
    private int idosoMaisVelho;
    private int idosoMaisNovo;
    private double percentualFeminino;
    private double percentualMasculino;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    private boolean fechado = false;

    @ElementCollection
    @CollectionTable(name = "checklist_mensal", joinColumns = @JoinColumn(name = "relatorio_id"))
    @MapKeyColumn(name = "item")
    @Column(name = "concluido")
    private Map<String, Boolean> checklist;

    private LocalDate dataCriacao = LocalDate.now();

    // Getters e Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getMes() { return mes; }
    public void setMes(int mes) { this.mes = mes; }

    public int getAno() { return ano; }
    public void setAno(int ano) { this.ano = ano; }

    public int getQuantidadeIdosos() { return quantidadeIdosos; }
    public void setQuantidadeIdosos(int quantidadeIdosos) { this.quantidadeIdosos = quantidadeIdosos; }

    public int getIdososAtivos() { return idososAtivos; }
    public void setIdososAtivos(int idososAtivos) { this.idososAtivos = idososAtivos; }

    public int getIdososInativos() { return idososInativos; }
    public void setIdososInativos(int idososInativos) { this.idososInativos = idososInativos; }

    public int getIdososFalecidos() { return idososFalecidos; }
    public void setIdososFalecidos(int idososFalecidos) { this.idososFalecidos = idososFalecidos; }

    public int getNovosCadastros() { return novosCadastros; }
    public void setNovosCadastros(int novosCadastros) { this.novosCadastros = novosCadastros; }

    public double getMediaIdade() { return mediaIdade; }
    public void setMediaIdade(double mediaIdade) { this.mediaIdade = mediaIdade; }

    public int getIdosoMaisVelho() { return idosoMaisVelho; }
    public void setIdosoMaisVelho(int idosoMaisVelho) { this.idosoMaisVelho = idosoMaisVelho; }

    public int getIdosoMaisNovo() { return idosoMaisNovo; }
    public void setIdosoMaisNovo(int idosoMaisNovo) { this.idosoMaisNovo = idosoMaisNovo; }

    public double getPercentualFeminino() { return percentualFeminino; }
    public void setPercentualFeminino(double percentualFeminino) { this.percentualFeminino = percentualFeminino; }

    public double getPercentualMasculino() { return percentualMasculino; }
    public void setPercentualMasculino(double percentualMasculino) { this.percentualMasculino = percentualMasculino; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public boolean isFechado() { return fechado; }
    public void setFechado(boolean fechado) { this.fechado = fechado; }

    public Map<String, Boolean> getChecklist() { return checklist; }
    public void setChecklist(Map<String, Boolean> checklist) { this.checklist = checklist; }

    public LocalDate getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDate dataCriacao) { this.dataCriacao = dataCriacao; }
}
