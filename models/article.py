class Article:
    def __init__(self, title, content):
        self.title = title
        self.content = content

        self.views = 0
        self.likes = 0
        self.shares = 0

        self.score = 0.0
        self.points = 0

        self.author = None  # ✅ NEW