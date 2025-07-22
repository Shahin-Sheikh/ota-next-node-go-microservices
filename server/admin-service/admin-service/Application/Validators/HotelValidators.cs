using FluentValidation;
using AdminService.Application.DTOs.Hotel;

namespace AdminService.Application.Validators;

public class CreateHotelValidator : AbstractValidator<CreateHotelDto>
{
    public CreateHotelValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Hotel name is required")
            .Length(1, 200).WithMessage("Hotel name must be between 1 and 200 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .Length(10, 2000).WithMessage("Description must be between 10 and 2000 characters");

        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Address is required")
            .Length(1, 500).WithMessage("Address must be between 1 and 500 characters");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required")
            .Length(1, 100).WithMessage("City must be between 1 and 100 characters");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Country is required")
            .Length(1, 100).WithMessage("Country must be between 1 and 100 characters");

        RuleFor(x => x.PostalCode)
            .NotEmpty().WithMessage("Postal code is required")
            .Length(1, 20).WithMessage("Postal code must be between 1 and 20 characters");

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90).WithMessage("Latitude must be between -90 and 90");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180).WithMessage("Longitude must be between -180 and 180");

        RuleFor(x => x.StarRating)
            .InclusiveBetween(1, 5).WithMessage("Star rating must be between 1 and 5");

        RuleFor(x => x.ContactPhone)
            .NotEmpty().WithMessage("Contact phone is required")
            .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Contact phone must be a valid phone number");

        RuleFor(x => x.ContactEmail)
            .NotEmpty().WithMessage("Contact email is required")
            .EmailAddress().WithMessage("Contact email must be valid");
    }
}

public class UpdateHotelValidator : AbstractValidator<UpdateHotelDto>
{
    public UpdateHotelValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Hotel name is required")
            .Length(1, 200).WithMessage("Hotel name must be between 1 and 200 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .Length(10, 2000).WithMessage("Description must be between 10 and 2000 characters");

        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Address is required")
            .Length(1, 500).WithMessage("Address must be between 1 and 500 characters");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required")
            .Length(1, 100).WithMessage("City must be between 1 and 100 characters");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Country is required")
            .Length(1, 100).WithMessage("Country must be between 1 and 100 characters");

        RuleFor(x => x.PostalCode)
            .NotEmpty().WithMessage("Postal code is required")
            .Length(1, 20).WithMessage("Postal code must be between 1 and 20 characters");

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90).WithMessage("Latitude must be between -90 and 90");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180).WithMessage("Longitude must be between -180 and 180");

        RuleFor(x => x.StarRating)
            .InclusiveBetween(1, 5).WithMessage("Star rating must be between 1 and 5");

        RuleFor(x => x.ContactPhone)
            .NotEmpty().WithMessage("Contact phone is required")
            .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Contact phone must be a valid phone number");

        RuleFor(x => x.ContactEmail)
            .NotEmpty().WithMessage("Contact email is required")
            .EmailAddress().WithMessage("Contact email must be valid");
    }
}
