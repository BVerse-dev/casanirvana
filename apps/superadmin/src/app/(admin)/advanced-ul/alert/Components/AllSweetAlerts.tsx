"use client";
import ComponentContainerCard from "@/components/ComponentContainerCard";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";

const AllSweetAlerts = () => {
  return (
    <>
      <ComponentContainerCard id="basic" title="Basic" titleClass="mb-3">
        <Button
          variant="primary"
          type="button"
          onClick={() =>
            Swal.fire({
              title: "Any fool can use a computer",
              customClass: {
                confirmButton: `btn btn-primary w-xs mt-2`,
              },
            })
          }
        >
          Click me
        </Button>
      </ComponentContainerCard>

      <ComponentContainerCard
        id="title"
        title="A Title with a Text Under"
        titleClass="mb-3"
      >
        <Button
          variant="primary"
          type="button"
          onClick={() =>
            Swal.fire({
              title: "The Internet?",
              text: "That thing is still around?",
              icon: "question",
              customClass: {
                confirmButton: `btn btn-primary w-xs mt-2`,
              },
            })
          }
        >
          Click me
        </Button>
      </ComponentContainerCard>

      <ComponentContainerCard id="message" title="Message" titleClass="mb-3">
        <div className="hstack gap-2">
          <Button
            variant="success"
            onClick={() =>
              Swal.fire({
                title: "Good job!",
                text: "You clicked the button!",
                icon: "success",
                showCancelButton: true,
                customClass: {
                  confirmButton: `btn btn-primary w-xs mt-2`,
                  cancelButton: "btn btn-danger w-xs mt-2",
                },

                buttonsStyling: false,
                showCloseButton: false,
              })
            }
          >
            Success
          </Button>
          <Button
            variant="warning"
            onClick={() =>
              Swal.fire({
                title: "Oops...",
                text: "Something went wrong!",
                icon: "warning",
                customClass: {
                  confirmButton: `btn btn-primary w-xs mt-2`,
                },
                buttonsStyling: false,
                footer: '<a href="">Why do I have this issue?</a>',
                showCloseButton: false,
              })
            }
          >
            Warning
          </Button>
          <Button
            variant="info"
            onClick={() =>
              Swal.fire({
                title: "Oops...",
                text: "Something went wrong!",
                icon: "info",
                customClass: {
                  confirmButton: `btn btn-primary w-xs mt-2`,
                },
                buttonsStyling: false,
                footer: '<a href="">Why do I have this issue?</a>',
                showCloseButton: false,
              })
            }
          >
            Info
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              Swal.fire({
                title: "Oops...",
                text: "Something went wrong!",
                icon: "error",
                customClass: {
                  confirmButton: `btn btn-primary w-xs mt-2`,
                },
                buttonsStyling: false,
                footer: '<a href="">Why do I have this issue?</a>',
                showCloseButton: false,
              })
            }
          >
            Error
          </Button>
        </div>
      </ComponentContainerCard>

      <ComponentContainerCard
        id="longcontent"
        title="Long content Images Message"
        titleClass="mb-3"
      >
        <Button
          variant="primary"
          onClick={() =>
            Swal.fire({
              imageUrl: "https://placeholder.pics/svg/300x1500",
              imageHeight: 1500,
              imageAlt: "A tall image",
              customClass: {
                confirmButton: `btn btn-primary w-xs mt-2`,
              },
              buttonsStyling: false,
              showCloseButton: false,
            })
          }
        >
          Click me
        </Button>
      </ComponentContainerCard>

      <ComponentContainerCard
        id="parameter"
        title="Parameter"
        titleClass="mb-3"
      >
        <Button
          variant="primary"
          type="button"
          onClick={() =>
            Swal
              .fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, cancel!",
                customClass: {
                  confirmButton: `btn btn-primary w-xs mt-2`,
                  cancelButton: "btn btn-danger w-xs mt-2",
                },
                buttonsStyling: false,
                showCloseButton: false,
              })
              .then((result) => {
                if (result.isConfirmed) {
                  Swal.fire({
                    title: "Deleted!",
                    text: "Your file has been deleted.",
                    icon: "success",
                    customClass: {
                      confirmButton: `btn btn-primary w-xs mt-2`,
                    },
                    buttonsStyling: false,
                  });
                } else if (
                  // Read more about handling dismissals
                  result.dismiss === Swal.DismissReason.cancel
                ) {
                  Swal.fire({
                    title: "Cancelled",
                    text: "Your imaginary file is safe :)",
                    icon: "error",
                    customClass: {
                      confirmButton: `btn btn-primary mt-2`,
                    },
                    buttonsStyling: false,
                  });
                }
              })
          }
        >
          Click me
        </Button>
      </ComponentContainerCard>
    </>
  );
};

export default AllSweetAlerts;
