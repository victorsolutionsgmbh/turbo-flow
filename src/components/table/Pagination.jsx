import React from "react";
import { rangeWithDots } from "./helpers";
import { useLanguage } from "../../i18n/LanguageContext";

export default function Pagination({ totalPages, currentPage, setCurrentPage, totalItems, itemsPerPage }) {
    const { t } = useLanguage();

    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="mt-6 space-y-3">
            <div className="text-center text-sm text-gray-600">
                {totalItems > 0 ? (
                    <>{t('pagination.showing', { start: startItem, end: endItem, total: totalItems })}</>
                ) : (
                    t('pagination.no_entries')
                )}
            </div>

            <div className="flex justify-center items-center flex-wrap gap-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                        currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                            : "bg-white text-blue-600 border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                    }`}
                    aria-label={t('pagination.prev_label')}
                >
                    {t('pagination.prev')}
                </button>

                {rangeWithDots(currentPage, totalPages).map((page, idx) =>
                    page === "..." ? (
                        <span key={`dots-${idx}`} className="px-2 py-2 text-gray-400 text-sm">…</span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                                page === currentPage
                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                    : "bg-white text-blue-600 border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                            }`}
                            aria-label={t('pagination.page_label', { page })}
                            aria-current={page === currentPage ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                        currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                            : "bg-white text-blue-600 border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                    }`}
                    aria-label={t('pagination.next_label')}
                >
                    {t('pagination.next')}
                </button>
            </div>
        </div>
    );
}
