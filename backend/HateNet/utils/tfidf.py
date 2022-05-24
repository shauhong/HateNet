import numpy as np
from HateNet.utils.preprocess import preprocess


def compute_c_tf(document):
    matrix = dict()
    for term in document:
        matrix[term] = matrix.get(term, 0) + 1
    for term in matrix:
        matrix[term] = matrix[term] / len(document)
    return matrix


def compute_idf(documents):
    terms = set()
    for label in documents:
        for term in documents[label]:
            terms.add(term)
    terms = list(terms)
    matrix = dict()
    for term in terms:
        total = 0
        for label in documents:
            if term in documents[label]:
                total += 1
        matrix[term] = np.log(len(documents) / total) if total > 0 else 0
    return matrix


def compute_c_tf_idf(documents):
    documents = {label: preprocess(documents[label]) for label in documents}
    term_matrices = dict()
    for label in documents:
        term_matrices[label] = compute_c_tf(documents[label])
    inverse_document_matrix = compute_idf(documents)
    matrices = dict()
    for label in term_matrices:
        matrices[label] = dict()
        for term in term_matrices[label]:
            matrices[label][term] = term_matrices[label][term] * \
                inverse_document_matrix[term]
    for label in matrices:
        matrices[label] = {k: v for k, v in sorted(
            matrices[label].items(), key=lambda item: item[1], reverse=True)}
    return matrices
