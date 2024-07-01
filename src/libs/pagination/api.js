const pagination = async (model, query, currentPage, limit)=>{

    const totalDocuments = await model.find(query).countDocuments();
    const totalPages = Math.ceil(totalDocuments/limit);
    const next = currentPage + 1;
    const prev = currentPage - 1;
    const hasNext = currentPage < totalPages? true: false;
    const hasPrev = currentPage > 1? true: false;

    return {
        totalDocuments,
        currentPage,
        next,
        prev,
        hasNext,
        hasPrev,
        totalPages
    }
}
module.exports = pagination;
