package com.assisconnect.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "visitas")
public class Visita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "idoso_id", nullable = false)
    private Long idosoId;

    private LocalDate dataVisita;

    private String nomeVisitante;
    private String parentesco;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdosoId() { return idosoId; }
    public void setIdosoId(Long idosoId) { this.idosoId = idosoId; }

    public LocalDate getDataVisita() { return dataVisita; }
    public void setDataVisita(LocalDate dataVisita) { this.dataVisita = dataVisita; }

    public String getNomeVisitante() { return nomeVisitante; }
    public void setNomeVisitante(String nomeVisitante) { this.nomeVisitante = nomeVisitante; }

    public String getParentesco() { return parentesco; }
    public void setParentesco(String parentesco) { this.parentesco = parentesco; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}
