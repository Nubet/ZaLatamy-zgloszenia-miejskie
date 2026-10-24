from botocore.client import Config
from botocore.exceptions import ClientError
import boto3

from .config import settings

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_PHOTO_BYTES = 8 * 1024 * 1024


def client():
    kwargs: dict = {
        "aws_access_key_id": settings.s3_access_key,
        "aws_secret_access_key": settings.s3_secret_key,
        "region_name": settings.s3_region,
        "config": Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    }
    if settings.s3_endpoint_url:
        kwargs["endpoint_url"] = settings.s3_endpoint_url
    return boto3.client("s3", **kwargs)


def ensure_bucket() -> None:
    s3 = client()
    try:
        s3.head_bucket(Bucket=settings.s3_bucket)
    except ClientError:
        params = {"Bucket": settings.s3_bucket}
        if settings.s3_region and not settings.s3_endpoint_url:
            params["CreateBucketConfiguration"] = {"LocationConstraint": settings.s3_region}
        try:
            s3.create_bucket(**params)
        except ClientError as error:
            code = error.response.get("Error", {}).get("Code", "")
            if code not in {"BucketAlreadyOwnedByYou", "BucketAlreadyExists"}:
                raise


def put_photo(storage_key: str, body: bytes, content_type: str) -> None:
    client().put_object(
        Bucket=settings.s3_bucket,
        Key=storage_key,
        Body=body,
        ContentType=content_type,
    )


def get_photo(storage_key: str) -> tuple[bytes, str] | None:
    try:
        response = client().get_object(Bucket=settings.s3_bucket, Key=storage_key)
    except ClientError:
        return None
    return response["Body"].read(), response.get("ContentType") or "application/octet-stream"


def delete_keys(keys: list[str]) -> None:
    if not keys:
        return
    client().delete_objects(
        Bucket=settings.s3_bucket,
        Delete={"Objects": [{"Key": key} for key in keys]},
    )


def list_photo_keys() -> list[str]:
    s3 = client()
    keys: list[str] = []
    token = None
    while True:
        kwargs = {"Bucket": settings.s3_bucket, "Prefix": "photos/"}
        if token:
            kwargs["ContinuationToken"] = token
        page = s3.list_objects_v2(**kwargs)
        for item in page.get("Contents") or []:
            keys.append(item["Key"])
        if not page.get("IsTruncated"):
            break
        token = page.get("NextContinuationToken")
    return keys
