package com.assisconnect.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "atividade")
public class Atividade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(name = "data_registro")
    private String dataRegistro;

    @Column(name = "hora_registro")
    private String horaRegistro;

    @ElementCollection
    @CollectionTable(name = "atividade_presentes", joinColumns = @JoinColumn(name = "atividade_id"))
    @AttributeOverrides({
            @AttributeOverride(name = "nome", column = @Column(name = "presente")),
            @AttributeOverride(name = "data", column = @Column(name = "data_presenca")),
            @AttributeOverride(name = "hora", column = @Column(name = "horario_presenca"))
    })
    private List<PresencaSimples> presentes;

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDataRegistro() { return dataRegistro; }
    public void setDataRegistro(String dataRegistro) { this.dataRegistro = dataRegistro; }

    public String getHoraRegistro() { return horaRegistro; }
    public void setHoraRegistro(String horaRegistro) { this.horaRegistro = horaRegistro; }

    public List<PresencaSimples> getPresentes() { return presentes; }
    public void setPresentes(List<PresencaSimples> presentes) { this.presentes = presentes; }
}
