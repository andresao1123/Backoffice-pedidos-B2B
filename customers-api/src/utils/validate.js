export const validate = (schema, data, res) => {
    const result = schema.safeParse(data);
    if (!result.success) {
        res.status(400).json({
            error: result.error.issues.map(e => e.message),
        });
        return null;
    }
    return result.data;
};
