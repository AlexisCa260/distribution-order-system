import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box, Container, Heading, Text, SimpleGrid, Button,
  HStack, Badge, Image, VStack, Divider, Flex, List,
  ListItem, ListIcon, OrderedList,
} from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Clock, Users, ChefHat, ArrowLeft, ShoppingBag, Lightbulb } from "lucide-react";
import Header from "../../components/utils/Header";
import Footer from "../../components/utils/Footer";
import SEOMeta from "../../components/utils/SEOMeta";
import PageLoader from "../../components/utils/PageLoader";
import NotFound from "./NotFound";
import { getRecipeBySlug, recipes } from "../../data/recipes";

const MotionBox = motion(Box);

const STORE_ID = 1;
const difficultyColor = { Fácil: "green", Media: "orange", Difícil: "red" };

export default function RecipeDetailPage() {
  const { slug }       = useParams();
  const recipe         = getRecipeBySlug(slug);
  const prefersReduced = useReducedMotion();

  const [imgError, setImgError] = useState(false);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/public/store/${STORE_ID}/page/home`)
      .then((res) => res.json())
      .then((data) => setPageData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!recipe) return <NotFound />;

  const related = recipes.filter((r) => r.slug !== slug && r.category === recipe.category).slice(0, 3);

  const BASE_URL = "https://comercializadoramorenosantos.com";
  const recipeUrl = `${BASE_URL}/recetas/${recipe.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Recipe",
        "@id": recipeUrl,
        name: recipe.title,
        description: recipe.description,
        image: [recipe.fallback_image],
        url: recipeUrl,
        author: {
          "@type": "Organization",
          name: "Comercializadora Moreno Santos",
          url: BASE_URL,
        },
        publisher: {
          "@type": "Organization",
          name: "Comercializadora Moreno Santos",
          logo: {
            "@type": "ImageObject",
            url: `${BASE_URL}/images/logo.png`,
            width: 200,
            height: 80,
          },
        },
        datePublished: recipe.datePublished || "2026-01-01",
        prepTime: `PT${recipe.prep_time}M`,
        cookTime: `PT${recipe.cook_time}M`,
        totalTime: `PT${recipe.total_time}M`,
        recipeYield: `${recipe.servings} porciones`,
        recipeCategory: recipe.category,
        recipeCuisine: "Colombiana",
        keywords: recipe.keywords,
        recipeIngredient: recipe.ingredients,
        recipeInstructions: recipe.instructions.map((step, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: step.split(/[.,]/)[0].substring(0, 80).trim(),
          text: step,
          url: `${recipeUrl}#paso-${i + 1}`,
        })),
        ...(recipe.calories && {
          nutrition: {
            "@type": "NutritionInformation",
            calories: `${recipe.calories} kcal`,
            servingSize: "1 porción",
          },
        }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Recetas Colombianas", item: `${BASE_URL}/recetas` },
          { "@type": "ListItem", position: 3, name: recipe.title, item: recipeUrl },
        ],
      },
    ],
  };

  return (
    <>
      <SEOMeta
        title={recipe.title}
        canonical={`/recetas/${recipe.slug}`}
        description={recipe.description}
        keywords={recipe.keywords}
        image={recipe.fallback_image}
        type="article"
        schema={schema}
      />
      <Header config={pageData?.sections?.header} />

      {/* ── Hero de la receta ── */}
      <Box as="section" position="relative" overflow="hidden" bg="gray.900" minH={{ base: "320px", md: "420px" }}>
        <Image
          src={imgError ? recipe.fallback_image : recipe.image}
          alt={recipe.title}
          position="absolute" inset={0}
          w="full" h="full" objectFit="cover"
          onError={() => setImgError(true)}
          opacity={0.45}
        />
        <Box position="absolute" inset={0} bgGradient="linear(to-t, blackAlpha.900 0%, blackAlpha.400 60%, transparent 100%)" />

        <Container maxW="4xl" position="relative" pt={{ base: 12, md: 16 }} pb={{ base: 10, md: 14 }}>
          <MotionBox
            initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Button
              as={Link}
              to="/recetas"
              size="sm"
              variant="ghost"
              color="whiteAlpha.800"
              leftIcon={<ArrowLeft size={15} />}
              _hover={{ color: "white", bg: "whiteAlpha.200" }}
              mb={5}
            >
              Todas las recetas
            </Button>

            <HStack spacing={2} mb={4} flexWrap="wrap">
              <Badge colorScheme={difficultyColor[recipe.difficulty] || "gray"} rounded="full" px={3} py={1}>
                {recipe.difficulty}
              </Badge>
              <Badge bg="whiteAlpha.300" color="white" rounded="full" px={3} py={1}>
                {recipe.category}
              </Badge>
            </HStack>

            <Heading
              as="h1"
              fontSize={{ base: "2xl", md: "4xl" }}
              fontWeight="extrabold"
              color="white"
              lineHeight={1.2}
              mb={2}
            >
              {recipe.title}
            </Heading>
            <Text color="whiteAlpha.800" fontSize={{ base: "sm", md: "md" }} maxW="2xl">
              {recipe.subtitle}
            </Text>
          </MotionBox>
        </Container>
      </Box>

      {/* ── Meta pills ── */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.100" py={{ base: 3, md: 4 }}>
        <Container maxW="4xl">
          {/* Mobile: grid 3 cols */}
          <SimpleGrid columns={{ base: 3, md: 5 }} spacing={{ base: 2, md: 6 }}>
            <MetaPill icon={<Clock size={14} />} label="Prep."     value={`${recipe.prep_time} min`} />
            <MetaPill icon={<Clock size={14} />} label="Cocción"   value={`${recipe.cook_time} min`} />
            <MetaPill icon={<Clock size={14} />} label="Total"     value={`${recipe.total_time} min`} color="green.600" />
            <MetaPill icon={<Users size={14} />} label="Porciones" value={`${recipe.servings} pers.`} />
            <MetaPill icon={<ChefHat size={14} />} label="Nivel"   value={recipe.difficulty} />
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── Cuerpo principal ── */}
      <Box bg="gray.50" py={{ base: 8, md: 12 }}>
        <Container maxW="4xl">
          <SimpleGrid columns={{ base: 1, md: 5 }} spacing={{ base: 5, md: 10 }} alignItems="start">

            {/* Ingredientes */}
            <Box gridColumn={{ md: "span 2" }}>
              <Box bg="white" rounded="2xl" p={{ base: 4, md: 6 }} shadow="sm" border="1px solid" borderColor="gray.100">
                <HStack mb={5} spacing={3}>
                  <Box
                    w="40px" h="40px" rounded="xl" bg="green.50"
                    display="flex" alignItems="center" justifyContent="center" color="green.600"
                  >
                    <ChefHat size={20} />
                  </Box>
                  <Heading as="h2" fontSize="xl" fontWeight="bold" color="gray.900">
                    Ingredientes
                  </Heading>
                </HStack>

                <Text fontSize="xs" color="gray.400" mb={4}>Para {recipe.servings} porciones</Text>

                <List spacing={3}>
                  {recipe.ingredients.map((ing, i) => (
                    <ListItem key={i} display="flex" alignItems="flex-start" fontSize="sm" color="gray.700">
                      <ListIcon as={() => <CheckCircle2 size={15} color="#16a34a" style={{ marginTop: 2, marginRight: 8, flexShrink: 0 }} />} />
                      {ing}
                    </ListItem>
                  ))}
                </List>

                {/* Tip */}
                {recipe.tips && (
                  <Box mt={6} p={4} bg="green.50" rounded="xl" border="1px solid" borderColor="green.100">
                    <HStack spacing={2} mb={2}>
                      <Lightbulb size={15} color="#16a34a" />
                      <Text fontSize="xs" fontWeight="bold" color="green.700" textTransform="uppercase" letterSpacing="wide">
                        Consejo del chef
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="green.800">{recipe.tips}</Text>
                  </Box>
                )}

                {/* CTA productos */}
                <Divider my={5} />
                <Text fontSize="xs" color="gray.500" mb={3} fontWeight="semibold">
                  Ingredientes que vendemos:
                </Text>
                <VStack spacing={2} align="stretch">
                  {recipe.related_products.map((p) => (
                    <Button
                      key={p}
                      as={Link}
                      to="/products"
                      size="xs"
                      variant="outline"
                      borderColor="green.200"
                      color="green.700"
                      rounded="lg"
                      leftIcon={<ShoppingBag size={12} />}
                      _hover={{ bg: "green.50" }}
                      justifyContent="flex-start"
                    >
                      {p}
                    </Button>
                  ))}
                </VStack>
              </Box>
            </Box>

            {/* Instrucciones */}
            <Box gridColumn={{ md: "span 3" }}>
              <Box bg="white" rounded="2xl" p={{ base: 4, md: 6 }} shadow="sm" border="1px solid" borderColor="gray.100">
                <HStack mb={6} spacing={3}>
                  <Box
                    w="40px" h="40px" rounded="xl" bg="green.50"
                    display="flex" alignItems="center" justifyContent="center" color="green.600"
                  >
                    <ChefHat size={20} />
                  </Box>
                  <Heading as="h2" fontSize="xl" fontWeight="bold" color="gray.900">
                    Preparación
                  </Heading>
                </HStack>

                <OrderedList spacing={5} styleType="none" ml={0}>
                  {recipe.instructions.map((step, i) => (
                    <ListItem key={i} id={`paso-${i + 1}`} display="flex" alignItems="flex-start" gap={4}>
                      <Flex
                        flexShrink={0}
                        w="32px" h="32px" rounded="full"
                        bg="green.600" color="white"
                        align="center" justify="center"
                        fontSize="sm" fontWeight="bold"
                      >
                        {i + 1}
                      </Flex>
                      <Text fontSize="sm" color="gray.700" lineHeight={1.7} pt={1}>
                        {step}
                      </Text>
                    </ListItem>
                  ))}
                </OrderedList>
              </Box>

              {/* Tags */}
              <Box mt={6}>
                <HStack spacing={2} flexWrap="wrap">
                  {recipe.tags.map((tag) => (
                    <Badge key={tag} variant="subtle" colorScheme="green" rounded="full" px={3} py={1} fontSize="xs">
                      #{tag}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── Recetas relacionadas ── */}
      {related.length > 0 && (
        <Box bg="white" py={{ base: 8, md: 12 }} borderTop="1px solid" borderColor="gray.100">
          <Container maxW="7xl">
            <Heading as="h2" fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold" color="gray.900" mb={{ base: 4, md: 8 }}>
              Más recetas de {recipe.category}
            </Heading>

            {/* Mobile: horizontal scroll */}
            <Box display={{ base: "block", md: "none" }} overflowX="auto" mx={-4} px={4}
              sx={{ "&::-webkit-scrollbar": { display: "none" } }}>
              <HStack spacing={3} w="max-content" pb={2}>
                {related.map((r) => (
                  <Box key={r.slug} w="220px" flexShrink={0}>
                    <RelatedCard recipe={r} />
                  </Box>
                ))}
              </HStack>
            </Box>

            {/* Desktop: grid */}
            <SimpleGrid display={{ base: "none", md: "grid" }} columns={{ sm: 2, md: 3 }} spacing={6}>
              {related.map((r) => (
                <RelatedCard key={r.slug} recipe={r} />
              ))}
            </SimpleGrid>
          </Container>
        </Box>
      )}

      {/* ── CTA final ── */}
      <Box bg="green.700" py={{ base: 10, md: 12 }}>
        <Container maxW="2xl" textAlign="center">
          <Heading as="h2" color="white" fontSize={{ base: "lg", md: "2xl" }} mb={3}>
            ¿Necesitas estos ingredientes al por mayor?
          </Heading>
          <Text color="whiteAlpha.800" mb={6} fontSize={{ base: "sm", md: "md" }}>
            Somos distribuidores de pollo, carnes frías, papas y más en Antioquia.
          </Text>
          <VStack spacing={3} display={{ base: "flex", sm: "none" }}>
            <Button
              as={Link} to="/products"
              size="md" w="full"
              bg="white" color="green.700" fontWeight="bold" rounded="xl"
              _hover={{ bg: "green.50" }}
            >
              Ver productos
            </Button>
            <Button
              as={Link} to="/contact"
              size="md" w="full"
              variant="outline" borderColor="whiteAlpha.600" color="white" rounded="xl"
              _hover={{ bg: "whiteAlpha.200", borderColor: "white" }}
            >
              Contactar
            </Button>
          </VStack>
          <HStack justify="center" spacing={3} display={{ base: "none", sm: "flex" }}>
            <Button
              as={Link} to="/products"
              size="lg" bg="white" color="green.700" fontWeight="bold" rounded="xl" px={8}
              _hover={{ bg: "green.50", transform: "translateY(-2px)" }}
              sx={{ transition: "all 0.2s" }}
            >
              Ver productos
            </Button>
            <Button
              as={Link} to="/contact"
              size="lg" variant="outline" borderColor="whiteAlpha.600" color="white" rounded="xl" px={8}
              _hover={{ bg: "whiteAlpha.200", borderColor: "white" }}
              sx={{ transition: "all 0.2s" }}
            >
              Contactar
            </Button>
          </HStack>
        </Container>
      </Box>

      <Footer config={pageData?.sections?.footer} />
    </>
  );
}

function MetaPill({ icon, label, value, color = "gray.700" }) {
  return (
    <VStack spacing={0} align="center">
      <HStack spacing={1} color="gray.400" fontSize={{ base: "2xs", md: "xs" }}>
        {icon}
        <Text>{label}</Text>
      </HStack>
      <Text fontWeight="bold" fontSize={{ base: "xs", md: "sm" }} color={color}>{value}</Text>
    </VStack>
  );
}

function RelatedCard({ recipe }) {
  const [imgError, setImgError] = useState(false);
  return (
    <Box
      as={Link}
      to={`/recetas/${recipe.slug}`}
      display="block"
      bg="white"
      rounded="2xl"
      overflow="hidden"
      shadow="sm"
      border="1px solid"
      borderColor="gray.100"
      transition="all 0.2s"
      _hover={{ shadow: "lg", transform: "translateY(-3px)", borderColor: "green.200" }}
    >
      <Box h="140px" bg="gray.100" overflow="hidden">
        <Image
          src={imgError ? recipe.fallback_image : recipe.image}
          alt={recipe.title}
          w="full" h="full" objectFit="cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </Box>
      <Box p={4}>
        <Text fontSize="xs" color="green.600" fontWeight="bold" mb={1}>{recipe.category}</Text>
        <Text fontSize="sm" fontWeight="semibold" color="gray.800" noOfLines={2}>{recipe.title}</Text>
        <HStack spacing={3} mt={2} fontSize="xs" color="gray.400">
          <HStack spacing={1}><Clock size={11} /><Text>{recipe.total_time} min</Text></HStack>
          <HStack spacing={1}><Users size={11} /><Text>{recipe.servings} pers.</Text></HStack>
        </HStack>
      </Box>
    </Box>
  );
}
