import Joi from "joi";

class PessoaIdosaModel {
  constructor(data = {}, options = { allowPartial: false }) {
    const schema = options.allowPartial
      ? PessoaIdosaModel.partialSchema
      : PessoaIdosaModel.schema;

    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
      throw new Error(
        `Erro de validação: ${error.details.map((d) => d.message).join(", ")}`
      );
    }

    Object.assign(this, value);
  }

  toJSON() {
    return { ...this };
  }

  // Schema completo para criação
  static get schema() {
    return Joi.object({
      nome: Joi.string().required(),
      idade: Joi.number().min(0).required(),

      cpf: Joi.string()
        .pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
        .required(),

      peso_kg: Joi.number().positive().required(),
      altura_cm: Joi.number().positive().required(),

      genero: Joi.string().valid("Feminino", "Masculino", "Outro").required(),

      condicoes: Joi.array().items(Joi.string()).default([]),

      endereco: Joi.object({
        cep: Joi.string().pattern(/^\d{5}-\d{3}$/).required(),
        cidade: Joi.string().required(),
        estado: Joi.string().length(2).uppercase().required(),
        rua: Joi.string().required(),
      }).required(),

      medicamentos: Joi.object({
        nome: Joi.string().required(),
        dosagem_mg: Joi.number().positive().required(),
        frequencia_dia: Joi.number().integer().min(1).required(),
      }).required(),

      humor: Joi.number().min(1).max(5).required(),
      alimentacao: Joi.string().required(),
      comentario: Joi.string().allow("").optional(),

      responsavelRef: Joi.string()
        .pattern(/^usuarios\/[A-Za-z0-9_-]+$/)
        .required(),

      createdAt: Joi.date().default(() => new Date()),
    });
  }

  // Schema parcial para updates
  static get partialSchema() {
    return this.schema.fork(Object.keys(this.schema.describe().keys), (s) =>
      s.optional()
    );
  }
}

export default PessoaIdosaModel;
