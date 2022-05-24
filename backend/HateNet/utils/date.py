import calendar
from dateutil import parser


def format_date(date, fmt="%Y-%m-%dT%H:%M:%SZ"):
    datestring = date.strftime(fmt)
    return datestring


def get_month_end(year, month):
    months = {
        1: 31,
        2: 28,
        3: 31,
        4: 30,
        5: 31,
        6: 30,
        7: 31,
        8: 31,
        9: 30,
        10: 31,
        11: 30,
        12: 31
    }
    if calendar.isleap(year):
        months['Feb'] = 29
    return months[month]


def parse_datestring(datestring):
    date = parser.parse(datestring)
    return date
