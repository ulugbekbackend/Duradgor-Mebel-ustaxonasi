from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """Standart sahifalash: ?page=2&page_size=12 (maks. 48)."""

    page_size = 9
    page_size_query_param = "page_size"
    max_page_size = 48
    page_query_param = "page"
