export const validateLambda = (schema, data) => {
    const result = schema.safeParse(data);

    if (!result.success) {
        return {
            error: result.error.issues.map(e => e.message),
        };
    }

    return {
        data: result.data,
    };
};
