import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  console.log("req.body:", req.body);
  console.log("req.query:", req.query);
  console.log("req.params:", req.params);

  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    next(err);
  }
};
