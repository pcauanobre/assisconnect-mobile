export function ok(res, data){ return res.json(data); }
export function created(res, data){ return res.status(201).json(data); }
