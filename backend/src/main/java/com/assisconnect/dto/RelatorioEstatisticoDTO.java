package com.assisconnect.dto;

public class RelatorioEstatisticoDTO {
    private int quantidadeIdosos;
    private double mediaIdade;
    private double percentualFeminino;
    private double percentualMasculino;
    private double percentualOutro; // ✅ Adicionado

    public RelatorioEstatisticoDTO(int quantidadeIdosos, double mediaIdade, double percentualFeminino, double percentualMasculino, double percentualOutro) {
        this.quantidadeIdosos = quantidadeIdosos;
        this.mediaIdade = mediaIdade;
        this.percentualFeminino = percentualFeminino;
        this.percentualMasculino = percentualMasculino;
        this.percentualOutro = percentualOutro; // ✅ Adicionado
    }

    public int getQuantidadeIdosos() {
        return quantidadeIdosos;
    }

    public double getMediaIdade() {
        return mediaIdade;
    }

    public double getPercentualFeminino() {
        return percentualFeminino;
    }

    public double getPercentualMasculino() {
        return percentualMasculino;
    }

    public double getPercentualOutro() { // ✅ Getter adicionado
        return percentualOutro;
    }
}
