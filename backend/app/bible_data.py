from datetime import datetime

DAILY_VERSES = [
    {
        "reference": "John 3:16",
        "text": "For God so loved the world that he gave his only Son, that whoever believes in him should not perish but have eternal life."
    },
    {
        "reference": "Psalm 23:1",
        "text": "The Lord is my shepherd; I shall not want."
    },
    {
        "reference": "Philippians 4:13",
        "text": "I can do all things through him who strengthens me."
    },
    {
        "reference": "Proverbs 3:5",
        "text": "Trust in the Lord with all your heart, and do not lean on your own understanding."
    },
    {
        "reference": "Romans 8:28",
        "text": "And we know that for those who love God all things work together for good, for those who are called according to his purpose."
    },
    {
        "reference": "Matthew 11:28",
        "text": "Come to me, all who labor and are heavy laden, and I will give you rest."
    },
    {
        "reference": "Psalm 119:105",
        "text": "Your word is a lamp to my feet and a light to my path."
    }
]

BIBLE_BOOKS = {
    "John": {
        1: [
            "In the beginning was the Word, and the Word was with God, and the Word was God.",
            "He was in the beginning with God.",
            "All things were made through him, and without him was not any thing made that was made.",
            "In him was life, and the life was the light of men.",
            "The light shines in the darkness, and the darkness has not overcome it."
        ],
        3: [
            "Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.",
            "This man came to Jesus by night and said to him, 'Rabbi, we know that you are a teacher come from God.'",
            "Jesus answered him, 'Truly, truly, I say to you, unless one is born again he cannot see the kingdom of God.'",
            "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
            "For God did not send his Son into the world to condemn the world, but in order that the world might be saved through him."
        ]
    },
    "Psalm": {
        23: [
            "The Lord is my shepherd; I shall not want.",
            "He makes me lie down in green pastures. He leads me beside still waters.",
            "He restores my soul. He leads me in paths of righteousness for his name's sake.",
            "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me.",
            "You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows."
        ]
    },
    "Genesis": {
        1: [
            "In the beginning, God created the heavens and the earth.",
            "The earth was without form and void, and darkness was over the face of the deep.",
            "And God said, 'Let there be light,' and there was light.",
            "And God saw that the light was good. And God separated the light from the darkness.",
            "And God called the light Day, and the darkness he called Night."
        ]
    }
}


def get_daily_verse():
    index = datetime.utcnow().day % len(DAILY_VERSES)
    return DAILY_VERSES[index]


def get_books():
    return sorted(BIBLE_BOOKS.keys())


def get_chapters(book_name: str):
    book = BIBLE_BOOKS.get(book_name)
    if not book:
        return []
    return sorted(book.keys())


def get_passage(book_name: str, chapter: int):
    book = BIBLE_BOOKS.get(book_name)
    if not book:
        return None
    chapter_content = book.get(chapter)
    if not chapter_content:
        return None
    return [{"number": idx + 1, "text": text} for idx, text in enumerate(chapter_content)]
