import regex


def sentence_case(string):
    """
    Converts a string to sentence case.
    From http://stackoverflow.com/questions/39969202/convert-uppercase-string-to-sentence-case-in-python
    Args:
        string: The input string

    Returns:
        The string, now in sentence case
    """
    return '. '.join(i.capitalize() for i in string.split('. '))


def fix_40char_text(text):
    return sentence_case(regex.sub(r'\s{2,}', " ", text))
