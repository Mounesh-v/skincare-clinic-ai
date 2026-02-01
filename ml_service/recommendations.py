"""Product recommendation utilities."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List


class ProductRecommender:
    def __init__(self, data_path: Path) -> None:
        with data_path.open("r", encoding="utf-8") as file:
            self.products: List[Dict[str, object]] = json.load(file)

    def recommend(self, skin_type: str, concern: str, severity: str) -> List[Dict[str, object]]:
        skin_type = skin_type or "normal"
        concern = concern or "overall"

        def score(product: Dict[str, object]) -> float:
            base = 0.0
            product_skin_types_raw = product.get("skin_types", [])
            product_skin_types = [str(item) for item in product_skin_types_raw] if isinstance(product_skin_types_raw, list) else []
            if "all" in product_skin_types or skin_type in product_skin_types:
                base += 2.5
            concerns_raw = product.get("concerns", [])
            concerns = [str(item) for item in concerns_raw] if isinstance(concerns_raw, list) else []
            if concern in concerns:
                base += 2.0
            if severity == "High" and product.get("category") in {"Treatment", "Supplement"}:
                base += 0.5
            if product.get("category") == "Sunscreen":
                base += 0.3
            return base

        scored = sorted(
            self.products,
            key=lambda product: score(product),
            reverse=True,
        )
        return [self._select_fields(product) for product in scored[:5]]

    @staticmethod
    def _select_fields(product: Dict[str, object]) -> Dict[str, object]:
        return {
            "id": product.get("id"),
            "name": product.get("name"),
            "category": product.get("category"),
            "benefits": product.get("benefits", []),
            "price": product.get("price"),
            "image_url": product.get("image_url"),
        }


def load_recommender(data_dir: Path) -> ProductRecommender:
    return ProductRecommender(data_dir / "products.json")
