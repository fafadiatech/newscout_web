from rest_framework.response import Response
from rest_framework import exceptions, status
from rest_framework.exceptions import AuthenticationFailed
from collections import OrderedDict
from django.utils.translation import gettext_lazy as _


def create_error_response(response_data):
    """
    method used to create response data in given format
    """
    return OrderedDict({
        "header": {
            "status": "0"
        },
        "errors": response_data
    }
    )


def newscout_exception_handler(exc, context):
    """
    Returns the response that should be used for any given exception.
    """

    if isinstance(exc, AuthenticationFailed):
        data = create_error_response(
            {"invalid_credentials": "Unable to login with provided credentials"})
        return Response(data, status=status.HTTP_404_NOT_FOUND)

    if isinstance(exc, exceptions.APIException):
        data = create_error_response({"Msg": exc.detail})
        return Response(data, status=401)

    return None


class TokenIDMissing(exceptions.APIException):
    """
    exception is used to return error when
    token id for social authentication is missing
    """
    status_code = 400
    default_detail = _("Token id is missing or Invalid token id")
    default_code = "token_id_missing"


class ProviderMissing(exceptions.APIException):
    """
    exception is used to return error when
    provider for social authentication is missing
    """
    status_code = 400
    default_detail = _("Provider is missing or Invalid provider name")
    default_code = "provider_missing"


class SocialAuthTokenException(exceptions.APIException):
    """
    exception is used to return error when verifing and decoding google
    social auth token id
    """
    status_code = 400
    default_detail = _("Something went wrong, Please try again later")
    default_code = "google_token_exception"


class CampaignNotFoundException(exceptions.APIException):
    """
    exception is used to return error when campaign is not found
    """
    status_code = 404
    default_detail = _("Campaign not found")
    default_code = "campaign_not_found"


class AdGroupNotFoundException(exceptions.APIException):
    """
    exception is used to return error when adgroup is not found
    """
    status_code = 404
    default_detail = _("AdGroup not found")
    default_code = "adgroup_not_found"


class AdvertisementNotFoundException(exceptions.APIException):
    """
    exception is used to return error when advertisement is not found
    """
    status_code = 404
    default_detail = _("Advertisement not found")
    default_code = "ad_not_found"
