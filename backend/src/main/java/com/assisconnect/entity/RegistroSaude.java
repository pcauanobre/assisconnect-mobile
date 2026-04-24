package com.assisconnect.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "registros_saude")
public class RegistroSaude {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "idoso_id", nullable = false)
    private Long idosoId;

    private LocalDate data;

    private Double peso;
    private Integer pressaoSistolica;
    private Integer pressaoDiastolica;
    private Double temperatura;
    private Integer glicemia;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdosoId() { return idosoId; }
    public void setIdosoId(Long idosoId) { this.idosoId = idosoId; }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }

    public Double getPeso() { return peso; }
    public void setPeso(Double peso) { this.peso = peso; }

    public Integer getPressaoSistolica() { return pressaoSistolica; }
    public void setPressaoSistolica(Integer pressaoSistolica) { this.pressaoSistolica = pressaoSistolica; }

    public Integer getPressaoDiastolica() { return pressaoDiastolica; }
    public void setPressaoDiastolica(Integer pressaoDiastolica) { this.pressaoDiastolica = pressaoDiastolica; }

    public Double getTemperatura() { return temperatura; }
    public void setTemperatura(Double temperatura) { this.temperatura = temperatura; }

    public Integer getGlicemia() { return glicemia; }
    public void setGlicemia(Integer glicemia) { this.glicemia = glicemia; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}
