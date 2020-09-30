'use strict';

const createPaginationPages = ({quantity, currentPage}) => {
    const currentPageIndex = currentPage - 1;
    const hasPreviousPageLink = currentPageIndex !== 0;
    const hasNextPageLink = currentPageIndex !== quantity - 1;
  
    const pages = Array.from({length: quantity}, (_, index) => {
      const visibleIndex = index + 1;
      const isActive = index === currentPageIndex;
      const href = isActive ? null : `?page=${ visibleIndex }`;

      return {
        title: visibleIndex,
        href,
        isActive,
      };
    });
  
    if (hasPreviousPageLink) {
      const title = `Назад`;
      const href = `?page=${ currentPage - 1 }`;
  
      pages.unshift({
        title,
        href,
      });
    }
  
    if (hasNextPageLink) {
      const title = `Вперед`;
      const href = `?page=${ currentPage + 1 }`;
  
      pages.push({
        title,
        href,
      });
    }
  
    return pages;
};

module.exports = {
  createPaginationPages
}