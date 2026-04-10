package com.assisconnect.dto;

public class RelatorioEstatisticoDTO {
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
    private double percentualOutro;

    public RelatorioEstatisticoDTO(int quantidadeIdosos, int idososAtivos, int idososInativos,
                                   int idososFalecidos, int novosCadastros, double mediaIdade,
                                   int idosoMaisVelho, int idosoMaisNovo,
                                   double percentualFeminino, double percentualMasculino,
                                   double percentualOutro) {
        this.quantidadeIdosos = quantidadeIdosos;
        this.idososAtivos = idososAtivos;
        this.idososInativos = idososInativos;
        this.idososFalecidos = idososFalecidos;
        this.novosCadastros = novosCadastros;
        this.mediaIdade = mediaIdade;
        this.idosoMaisVelho = idosoMaisVelho;
        this.idosoMaisNovo = idosoMaisNovo;
        this.percentualFeminino = percentualFeminino;
        this.percentualMasculino = percentualMasculino;
        this.percentualOutro = percentualOutro;
    }

    public int getQuantidadeIdosos() { return quantidadeIdosos; }
    public int getIdososAtivos() { return idososAtivos; }
    public int getIdososInativos() { return idososInativos; }
    public int getIdososFalecidos() { return idososFalecidos; }
    public int getNovosCadastros() { return novosCadastros; }
    public double getMediaIdade() { return mediaIdade; }
    public int getIdosoMaisVelho() { return idosoMaisVelho; }
    public int getIdosoMaisNovo() { return idosoMaisNovo; }
    public double getPercentualFeminino() { return percentualFeminino; }
    public double getPercentualMasculino() { return percentualMasculino; }
    public double getPercentualOutro() { return percentualOutro; }
}
