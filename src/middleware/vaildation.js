export const vaildation = (schema) => {
  return (req, res, next) => {
    let errors = [];

    for (const key of Object.keys(schema)) {
      const result = schema[key].validate(req[key], { abortEarly: false });

      if (result?.error) {
        const details = result.error.details.map(err => err.message);
        errors.push(...details);
      } else {
        if (key === "query") {
          // متعملش reassignment للـ query
          Object.assign(req.query, result.value);
        } else {
          // body أو params عادي
          req[key] = { ...(req[key] || {}), ...result.value };
        }
      }
    }

    if (errors.length) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    return next();
  };
};
