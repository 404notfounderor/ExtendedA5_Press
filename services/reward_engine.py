def assign_rank_points(rank):
    if rank == 1:
        return 80
    elif rank in [2, 3]:
        return 40
    else:
        return 10


def calculate_engagement_points(article):
    points = 0
    points += (article.views // 100) * 5
    points += (article.likes // 10) * 5
    points += article.shares * 10
    return points


def assign_quality_bonus(score):
    if score >= 8:
        return 25
    elif score >= 6:
        return 10
    return 0


def calculate_total_points(article, rank):
    total = 0

    total += assign_rank_points(rank)
    total += calculate_engagement_points(article)
    total += assign_quality_bonus(article.score)

    article.points = total
    return total