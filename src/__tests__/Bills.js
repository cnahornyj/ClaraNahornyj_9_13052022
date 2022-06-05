/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I navigate to Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Admin", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "e@e",
          })
        );
        // simulation du router
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      // Crée un noeud pour intégrer le router
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      // Lance le router
      router();

      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      // A VOIR
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
  describe("When I click on NewBill Button", () => {
    test("Then I should be directed to the NewBill page", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = BillsUI({ bills });
      // Récupérer la classe Bills pour la simuler
      const newBill = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage,
      });
      // Récupérer la fonction dans cette classe
      const handleClickNewBill = jest.fn(newBill.handleClickNewBill);
      // Vérifier l'existence d'un btn new bill ?
      const btnNewBill = screen.getByTestId("btn-new-bill");
      // Passer un event click avec handClickNewBill en fonction
      btnNewBill.addEventListener("click", handleClickNewBill);
      // Simuler le click de l'utilisateur sur le btn
      userEvent.click(btnNewBill);
      // Vérifier que la fonction a bien été appelée
      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });
  describe("When I click on Eye Icon of a bill", () => {
    test("Then a modal is open", () => {
      // mock bootstrap
      $.fn.modal = jest.fn();
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const containerBills = new Bills({
        document,
        onNavigate,
        localStorage: null,
      });

      const handleClick = jest.spyOn(containerBills, "handleClickIconEye")
      const iconsEye = screen.getAllByTestId("icon-eye")
      const iconEye = iconsEye[0]
      iconEye.addEventListener("click", handleClick(iconEye))

      userEvent.click(iconEye)

      // tester les éléments en hidden true
      const modal = screen.getByRole("dialog", { hidden: true })
      const attachedFile = iconsEye[0]
        .getAttribute("data-bill-url")
        .split("?")[0];

      expect(handleClick).toHaveBeenCalled()
      expect(modal).toBeTruthy()
      expect(modal.innerHTML.includes(attachedFile)).toBeTruthy()
    });
  });
});
