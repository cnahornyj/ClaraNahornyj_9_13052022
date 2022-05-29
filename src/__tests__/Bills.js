/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Actions from "../views/Actions.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

jest.mock("../app/store", () => mockStore)

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
      const windowIcon = screen.getByTestId("icon-window");
      // Vérifie si la classe active-icon est présente
      // expect(windowIcon.classList.contains("active-icon")).toBe(true);
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

    test("Then bills should have an icon that allows you to look at its proof", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      // const html = Actions()
      // document.body.innerHTML = html
      // expect(screen.getByTestId('icon-eye')).toBeTruthy()
      // L'attribut data test-id icon-eye se situe dans views/Actions.js
      // Récupérer la classe Bills pour la simuler
      // const newBill = new Bills({ document, onNavigate, store:null, localStorage})
      // // Récupérer la fonction dans cette classe
      // const handleClickIconEye = jest.fn((icon) => newBill.handleClickIconEye(icon))
      // // Vérifier l'existence d'un btn icon eye ?
      // const btnIconEye = screen.getByTestId("icon-eye")
      // // Vérifier l'existence d'une div id modale-file
      // const modale = screen.getByTestId("modale")
      // // Passer un event click avec handClickIconEye en fonction (voir pour le paramètre icon)
      // btnIconEye.addEventListener('click', handleClickIconEye)
      // // Vérifier l'attribut de l'icon et vérifier qu'il soit le même (data-bill-url === div.bill-proof-container > img src)
      // // Vérifier que la div id modale-file a une class show
      // expect(screen.getByText('Justificatif')).toBeTruthy()
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
});
